import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";

export async function GET(req) {
  try {
    await connectMongoDB();

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

    const appointmentsData = await Appointment.aggregate([
      // Lookup for customer
      {
        $lookup: {
          from: "customers", // Collection name (plural usually)
          localField: "customerId",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      { $unwind: "$customerInfo" },

      // Lookup for staff
      {
        $lookup: {
          from: "staffs", // Collection name
          localField: "staffId",
          foreignField: "_id",
          as: "staffInfo",
        },
      },
      { $unwind: "$staffInfo" },

      // Project desired fields
      {
        $project: {
          appointmentNo: 1,
          bookingTimeAndDate: 1,
          category: 1,
          service: 1,
          payment: 1,
          "customerInfo.fullName": 1,
          "staffInfo.name": 1,
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
      { status: 500 }
    );
  }
}
