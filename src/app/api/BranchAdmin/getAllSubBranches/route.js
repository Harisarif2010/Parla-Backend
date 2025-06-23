import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Branch from "../../../../../models/Branch";
import mongoose from "mongoose";

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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const allSubBranches = await Branch.aggregate([
      {
        $match: { createdByBranchAdmin: new mongoose.Types.ObjectId(token.id) },
      },
      {
        $project: {
          fullName: 1,
          //   userName: 1,
          //   password: 1,
          branchName: 1,
          //   VAT: 1,
          //   text_amdinistrator: 1,
          //   category: 1,
          //   tax_plate: 1,
          //   registration: 1,
          //   license: 1,
          //   certificate: 1,
          //   payment_method: 1,
          //   free_cancel_before: 1,
          country: 1,
          city: 1,
          //   district: 1,
          //   town: 1,
          //   street: 1,
          //   gps_cordinates: 1,
          phone: 1,
          //   branch_phone: 1,
          //   branch_email: 1,
          //   working_hours: 1,
          createdByAdmin: 1,
          createdByBranchAdmin: 1,
          createdAt: 1,
          updatedAt: 1,
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
      {
        message: "All Sub-Branches Fetched Successfully",
        data: allSubBranches,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error Fetching All Sub-Branches", err);
    return NextResponse.json(
      { error: "Error Fetching All Sub-Branches" },
      { status: 500 }
    );
  }
}
