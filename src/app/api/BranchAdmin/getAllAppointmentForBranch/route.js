import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Appointment from "../../../../../models/Appointment";

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
    const status = searchParams.get("status"); // { status: "pending", "confirmed", "completed", "cancelled" }

    const appointmentsData = await Appointment.aggregate([
      {
        $match: {
          status: status || {
            $in: ["pending", "confirmed", "completed", "cancelled"],
          },
        },
      },
      {
        $lookup: {
          from: "users", // Collection name in MongoDB (must match the actual collection name)
          localField: "customerId",
          foreignField: "_id",
          as: "customerInfo",
        },
      },
      {
        $unwind: "$customerInfo", // Converts userInfo array to object
      },
      {
        $lookup: {
          from: "employees", // Collection name in MongoDB (must match the actual collection name)
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeInfo",
        },
      },
      {
        $unwind: "$employeeInfo", // Converts employeeInfo array to object
      },
      {
        $project: {
          appointmentNo: 1,
          bookingTimeAndDate: 1,
          category: 1,
          service: 1,
          payment: 1,
          "employeeInfo.fullName": 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await Appointment.countDocuments();

    return NextResponse.json({
      message: "Appointment retrieved successfully",
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
