import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Appointment from "../../../../../../models/Appointment";
import mongoose from "mongoose";

export async function GET(req) {
  await connectMongoDB();

  //   const token = await getToken(req);
  //   if (!token || token.error) {
  //     return NextResponse.json(
  //       { error: token?.error || "Unauthorized Access" },
  //       { status: 401, headers: corsHeaders }
  //     );
  //   }
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
      const getStatus = await Appointment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
      result = {
        appointmentLength: length,
        status: getStatus,
      };
    }
    return NextResponse.json(
      {
        message: "Finance Inofrmation Fetched Successfully",
        data: result,
      },
      {
        status: 400,
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
