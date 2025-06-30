import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Employee from "../../../../../../models/Employee";
import mongoose from "mongoose";
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
    const employeeId = searchParams.get("employeeId");

    const allEmployees = await Employee.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(employeeId),
        },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          // email: 1,
          image: 1,
          // userName: 1,
          // password: 1,
          // phone: 1,
          // role: 1,
          // category: 1,
          // createdByRole: 1,
          // createdById: 1,
        },
      },
      // Stage 2: Lookup for Appointment
      {
        $lookup: {
          from: "Appointments",
          localField: "_id",
          foreignField: "employeeId",
          as: "allAppointmentDetail",
        },
      },
      {
        $unwind: "$allAppointmentDetail",
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          image: 1,
          allAppointmentDetail: {
            // _id: 1,
            category: 1,
            appointmentNo: 1,
            // customerId: 1,
            employeeId: 1,
            service: 1,
            bookingTimeAndDate: 1,
            payment: 1,
            // timestamp: 1,
          },
        },
      },
    ]);

    return NextResponse.json({
      message: "All Appointments of this Employee retrieved successfully",
      data: allEmployees,
    });
  } catch (error) {
    console.error("Error in get all appointment of this employee:", error);
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
