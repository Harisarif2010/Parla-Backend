import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";

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
    const limit = parseInt(searchParams.get("limit")) || 10;
    const page = parseInt(searchParams.get("page")) || 1;
    const city = searchParams.get("city");
    const district = searchParams.get("distirct");
    const date = searchParams.get("date");

    // const totalCount = await Appointment.countDocuments({
    //   branchId: new mongoose.Types.ObjectId(branchId),
    // });
    let query = {};

    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    if (district) {
      query.district = { $regex: new RegExp(`^${district}$`, "i") };
    }

    if (date) {
      query.createdAt = date;
    }

    const appointments = await Appointment.aggregate([
      {
        $match: {
          query,
        },
      },
      {
        $project: {
          _id: 1,
          employeeId: 1,
          appointmentNo: 1,
          serviceName: 1,
          serviceMints: 1,
          price: 1,
          bookingTime: 1,
          bookingDate: 1,
          statsus: 1,
          employeeName: 1,
          timeestamp: 1,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
      {
        $sort: {
          timestamp: 1,
        },
      },
    ]);
    // const totalPages = Math.ceil(totalCount / limit);
    // const hasMore = page < totalPages;
    return NextResponse.json(
      {
        message: "All Appointments",
        data: appointments,
        status: 200,
        // pagination: {
        //   currentPage: page,
        //   totalPages,
        //   hasMore,
        //   totalCount,
        // },
      },
      {
        headers: corsHeaders, // ← Make sure to include CORS headers
      }
    );
  } catch (err) {
    console.error("Error Fetching All Appointment", err);
    return NextResponse.json(
      { error: "Error Fetching All Appointment" },
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
