import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../../libs/dbConnect";
import { corsHeaders } from "../../../../../../../libs/corsHeader";
import { getToken } from "../../../../../../../libs/getToken";
import Employee from "../../../../../../../models/Employee";
import mongoose from "mongoose";

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
  const branchId = searchParams.get("branchId");
  if (!branchId) {
    return NextResponse.json(
      {
        message: "BranchId is required",
      },
      {
        status: 400,
        header: corsHeaders,
      }
    );
  }
  try {
    let result = {};
    // All Employees Salary Length of this Branch
    const allEmployee = await Employee.find({
      branchId: new mongoose.Types.ObjectId(branchId),
    });
    const length = allEmployee.length;
   const allSalary = await Employee.aggregate([
     {
       $match: {
         branchId: new mongoose.Types.ObjectId(branchId),
       },
     },
     {
       $project: {
         _id: 1,
         firstName: 1,
         lastName: 1,
         salarayAmount: 1,
         commissionPercentage: 1,
       },
     },
   ]);

    result = {
      employeeLength: length,
      salary: allSalary,
    };

    return NextResponse.json(
      {
        message: "All Employees Salary Fetched Successfully",
        data: result,
      },
      {
        status: 200,
        header: corsHeaders,
      }
    );
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
