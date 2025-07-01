import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import { corsHeaders } from "../../../../../libs/corsHeader";
import Appointment from "../../../../../models/Appointment";

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
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    const skip = (page - 1) * limit;

    const appointmentsData = await Appointment.aggregate([
      {
        $match: {
          status: status,
          bookingTimeAndDate: date,
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      { $unwind: "$customerInfo" },
      // Project desired fields
      {
        $project: {
          appointmentNo: 1,
          bookingTimeAndDate: 1,
          category: 1,
          service: 1,
          payment: 1,
          "customerInfo.fullName": 1,
        },
      },

      { $skip: skip },
      { $limit: limit },
    ]);

    return NextResponse.json({
      message: "All Appointments retrieved successfully",
      data: appointmentsData,
      totalAppointment: total,
    });
  } catch (error) {
    console.error("Error in get all appointment:", error);
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
