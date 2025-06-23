import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Customer from "../../../../../models/Customer";

export async function GET(req) {
  try {
    await connectMongoDB();
    // Get The Token
    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const allCustomer = await Customer.aggregate([
      {
        $match: {
          branchId: branchId,
        },
      },
      {
        $lookup: {
          from: "branches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch",
        },
      },
      {
        $unwind: "$branch",
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          country: 1,
          phone: 1,
          "branch.branchName": 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    return NextResponse.json(
      { message: "All Customers Fetched Successfully", data: allCustomer },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error Fetching All Customer", err);
    return NextResponse.json(
      { error: "Error Fetching All Customer" },
      { status: 500 }
    );
  }
}
