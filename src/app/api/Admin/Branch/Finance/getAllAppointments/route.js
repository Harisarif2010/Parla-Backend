import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../../libs/corsHeader";
import Appointment from "../../../../../../../models/Appointment";
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
  const type = searchParams.get("type");
  if (!branchId || !type) {
    return NextResponse.json(
      {
        message: "All Fields are required",
      },
      {
        status: 400,
        header: corsHeaders,
      }
    );
  }
  try {
    let result = {};
    if (type === "accounting") {
      // Appointments Length of this Branch
      const allAppointments = await Appointment.find({
        branchId: new mongoose.Types.ObjectId(branchId),
      });
      const length = allAppointments.length;
      const statuses = ["pending", "confirmed", "completed", "cancelled"];
      const statusCounts = await Appointment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Convert to a map for easier access
      const statusMap = {};
      statusCounts.forEach((item) => {
        statusMap[item._id] = item.count;
      });

      // Fill in 0 for missing statuses
      const finalCounts = statuses.map((status) => ({
        status,
        count: statusMap[status] || 0,
      }));
      result = {
        appointmentLength: length,
        status: finalCounts,
      };
    }
    return NextResponse.json(
      {
        message: "Finance Inofrmation Fetched Successfully",
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
