import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Branch from "../../../../../models/Branch";

export async function GET(req) {
  await connectMongoDB();

  const token = await getToken(req);
  if (!token || token.error) {
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      { status: 401 }
    );
  }
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const skip = (page - 1) * limit;

  try {
    const result = await Branch.aggregate([
      {
        $match: {
          createdByAdmin: { $ne: null },
          createdByBranchAdmin: null,
        },
      },
      {
        $project: {
          fullName: 1,
        //   userName: 1,
        //   branchName: 1,
        //   branch_email: 1,
        //   branch_phone: 1,
        //   phone: 1,
        //   gps_cordinates: 1,
        //   city: 1,
        //   district: 1,
        //   country: 1,
        //   adminName: "$adminData.fullName", // only include admin fullName
          createdAt: -1,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const branches = result[0].data;
    // const total = result[0].totalCount[0]?.count || 0;

    return NextResponse.json({
      message: "Branches Fetched Successfully",
      data: branches,
    //   pagination: {
    //     total,
    //     page,
    //     limit,
    //     totalPages: Math.ceil(total / limit),
    //   },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
