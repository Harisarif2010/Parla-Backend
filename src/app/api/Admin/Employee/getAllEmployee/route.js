import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Employee from "../../../../../../models/Employee";
import { corsHeaders } from "../../../../../../libs/corsHeader";

export async function GET(req) {
  try {
    await connectMongoDB();

    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // const allEmployees = await Employee.aggregate([
    //   // Stage 2: Lookup for admins
    //   {
    //     $lookup: {
    //       from: "admins",
    //       localField: "createdById",
    //       foreignField: "_id",
    //       as: "createdByAdmin",
    //     },
    //   },
    //   // Stage 3: Lookup for branches
    //   {
    //     $lookup: {
    //       from: "branches",
    //       localField: "createdById",
    //       foreignField: "_id",
    //       as: "createdByBranch",
    //     },
    //   },
    //   // Stage 4: Merge the correct createdBy based on role
    //   {
    //     $addFields: {
    //       createdBy: {
    //         $cond: {
    //           if: { $eq: ["$createdByRole", "admin"] },
    //           then: { $arrayElemAt: ["$createdByAdmin", 0] },
    //           else: { $arrayElemAt: ["$createdByBranch", 0] },
    //         },
    //       },
    //     },
    //   },
    //   // Stage 5: Remove unnecessary fields
    //   {
    //     $project: {
    //       createdByAdmin: 0,
    //       createdByBranch: 0,
    //       password: 0, // or hide any other sensitive fields
    //     },
    //   },
    //   // Stage 6: Sort (optional but common with pagination)
    //   {
    //     $sort: { createdAt: -1 }, // newest first
    //   },
    //   // Stage 7: Skip
    //   {
    //     $skip: skip,
    //   },
    //   // Stage 8: Limit
    //   {
    //     $limit: limit,
    //   },
    // ]);

    const allEmployees = await Employee.aggregate([
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          fullName: 1,
          phone: 1,
          // Add or remove fields you need, set to 1 to include, 0 to exclude
        },
      },
    ]);
    const allEmployeesCount = await Employee.countDocuments();

    return NextResponse.json({
      message: "All Employees retrieved successfully",
      data: {
        employees: allEmployees,
        totalEmployees: allEmployeesCount,
      },
    });
  } catch (error) {
    console.error("Error in get all Employees:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
