import { NextResponse } from "next/server";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Branch from "../../../../../../models/Branch";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";

export async function GET(req) {
  await connectMongoDB();

  const token = await getToken(req);
  if (!token || token.error) {
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      { status: 401, headers: corsHeaders }
    );
  }
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const skip = (page - 1) * limit;

  // Step 1: Get total count of matching posts
  const totalCountAgg = await Branch.aggregate([{ $count: "total" }]);
  const total = totalCountAgg[0]?.total || 0;

  try {
    const allBranches = await Branch.find(
      {}
      // {
      //   _id: 1,
      //   firstName: 1,
      //   branchPhone: 1,
      //   // email: 1,
      //   // city: 1,
      //   // phone: 1,
      //   // branchNote: 1,
      //   // createdAt: 1,
      //   // updatedAt: 1,
      // }
    )
      //   .populate({
      //     path: "createdBy",
      //     select: "fullName email",
      //   })
      .skip(skip)
      .limit(limit);

    // Step 3: Calculate pagination meta
    const has_more = page * limit < total;
    // console.log(has_more);
    // console.log(page);
    const next_page = has_more ? page + 1 : null;

    return NextResponse.json({
      message: "Branches Fetched Successfully",
      data: allBranches,
      current_page: Number(page),
      next_page: Number(next_page),
      per_page: Number(limit),
      has_more,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
