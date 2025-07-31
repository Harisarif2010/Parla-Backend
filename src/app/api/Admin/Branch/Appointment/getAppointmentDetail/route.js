import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../../libs/corsHeader";
import mongoose from "mongoose";


export async function GET(req) {
  try {
    await connectMongoDB();
    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        { status: 401, headers: corsHeaders }
      );
    }
    const { searchParams } = new URL(req.url);
    // const limit = parseInt(searchParams.get("limit")) || 10;
    // const page = parseInt(searchParams.get("page")) || 1;
    const appointmentId = searchParams.get("appointmentId");

    // const totalCount = await Appointment.countDocuments({
    //   customerId: new mongoose.Types.ObjectId(token.id),
    //   status: type,
    // });
    const appointment = await Appointment.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(appointmentId),
        },
      },
    //   {
    //     $project: {
    //       _id: 1,
    //       appointmentNo: 1,
    //       serviceName: 1,
    //       serviceMints: 1,
    //       price: 1,
    //       bookingTimeAndDate: 1,
    //       employeeName: 1,
    //     },
    //   },
    //   {
    //     $skip: (page - 1) * limit,
    //   },
    //   {
    //     $limit: limit,
    //   },
    //   {
    //     $sort: {
    //       timestamp: -1,
    //     },
    //   },
    ]);
    // const totalPages = Math.ceil(totalCount / limit);
    // const hasMore = page < totalPages;
    return NextResponse.json(
      {
        message: "Appointment Detail",
        data: appointment,
        // pagination: {
        //   currentPage: page,
        //   totalPages,
        //   hasMore,
        //   totalCount,
        // },
      },
      {
        status: 200,
        headers: corsHeaders, // ← Make sure to include CORS headers
      }
    );
  } catch (err) {
    console.error("Error Fetching One Appointment Detail", err);
    return NextResponse.json(
      { error: "Error Fetching One Appointment Detail" },
      {
        status: 500,
        headers: corsHeaders, // ← Make sure to include CORS headers
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
