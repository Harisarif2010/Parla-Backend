import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Service from "../../../../../../models/Service";
import { corsHeaders } from "../../../../../../libs/corsHeader";

export async function GET(req) {
  try {
    await connectMongoDB();
    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        { status: 401, headers: corsHeaders }
      );
    }
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 10;
    const page = parseInt(searchParams.get("page")) || 1;
    const gender = searchParams.get("gender");
    const category = searchParams.get("category");

    let genders;
    if (gender === "male" || gender === "female") {
      genders = [gender];
    } else {
      genders = ["male", "female"];
    }

    const totalCount = await Service.countDocuments({
      gender: { $in: genders },
      category: category,
    });
    const getServices = await Service.aggregate([
      {
        $match: {
          gender: { $in: genders },
          category: category,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          serviceName: 1,
          serviceMints: 1,
          gender: 1,
          price: 1,
          category: 1,
          discount: 1,
          discountPrice: 1,
          discountPercentage: 1,
          discountStartDate: 1,
          discountEndDate: 1,
          onlyBetweenTime: 1,
          onlyBetweenTimeStartTime: 1,
          onlyBetweenEndTime: 1,
          onlyBetweenDays: 1,
          branchId: 1,
          createdAt: 1,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    return NextResponse.json(
      {
        message: "All Services",
        data: getServices,
        pagination: {
          currentPage: page,
          totalPages,
          hasMore,
          totalCount,
        },
      },
      {
        status: 200,
        headers: corsHeaders, // ← Make sure to include CORS headers
      }
    );
  } catch (err) {
    console.error("Error Fetching Services Data", err);
    return NextResponse.json(
      { error: "Error Fetching Services Data" },
      {
        status: 500,
        headers: corsHeaders, // ← Make sure to include CORS headers
      }
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
