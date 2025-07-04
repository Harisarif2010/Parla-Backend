import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import mongoose from "mongoose";
import Branch from "../../../../../../models/Branch";

export async function POST(req) {
  try {
    await connectMongoDB();

    // const token = await getToken(req);
    // if (!token || token.error) {
    //   return NextResponse.json(
    //     { error: token?.error || "Unauthorized Access" },
    //     {
    //       status: 401,
    //       headers: { ...corsHeaders, "Content-Type": "application/json" },
    //     }
    //   );
    // }

    const data = await req.json();
    const { branchId, type, vacationDays } = data;
    if (!branchId) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // GET the Working Hours of this Branch
    if (type === "info") {
      const allEmployees = await Branch.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(branchId),
          },
        },
        {
          $project: {
            workingHours: 1,
          },
        },
      ]);

      return NextResponse.json({
        message: "Branch Working Hours Retrieved Successfully",
        data: allEmployees,
      });
    }
    // GET the Address of this Branch
    if (type === "address") {
      const allEmployees = await Branch.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(branchId),
          },
        },
        {
          $project: {
            country: 1,
            city: 1,
            district: 1,
            town: 1,
            street: 1,
            doorNo: 1,
            streetNo: 1,
            location: 1,
          },
        },
      ]);

      return NextResponse.json({
        message: "Branch Working Hours Retrieved Successfully",
        data: allEmployees,
      });
    }
    // GET the Address of this Branch
    if (type === "vacation") {
      const allEmployees = await Branch.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(branchId),
          },
        },
        {
          $project: {
            vacationDays: 1,
          },
        },
      ]);

      return NextResponse.json({
        message: "Branch Vacation Days Retrieved Successfully",
        data: allEmployees,
      });
    }
    // ADD the Vacation Days of this employee
    if (type === "addVacation") {
      const employee = await Branch.findById(branchId);
      const add = (employee.vacationDays = vacationDays);

      await employee.save();
      return NextResponse.json({
        message: "Branch Vacation Days Saved Successfully",
        data: employee?.vacationDays,
      });
    }
  } catch (error) {
    console.error("Error in get detail of this employee:", error);
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
