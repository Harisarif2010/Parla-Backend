import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Appointment from "../../../../../../models/Appointment";

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
    const type = searchParams.get("type");
    const customerId = searchParams.get("customerId");

    // For Single Customer
    if (customerId) {
      const totalCount = await Appointment.countDocuments({
        customerId: new mongoose.Types.ObjectId(customerId),
        status: type,
      });
      const appointments = await Appointment.aggregate([
        {
          $match: {
            customerId: new mongoose.Types.ObjectId(customerId),
            status: type,
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
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;
      return NextResponse.json(
        {
          message: "All Appointments For Customer",
          data: appointments,
          pagination: {
            currentPage: page,
            totalPages,
            hasMore,
            totalCount,
          },
        },
        {
          status: 200,
          headers: corsHeaders, // ← Make sure to include CORS headers
        }
      );
    }

    // For Admin
    const totalCount = await Appointment.countDocuments({
      // customerId: new mongoose.Types.ObjectId(token.id),
      status: type,
    });
    const appointments = await Appointment.aggregate([
      {
        $match: {
          // customerId: new mongoose.Types.ObjectId(token.id),
          serviceCategory: type,
        },
      },
      // ---- Lookup Branch ----
      {
        $lookup: {
          from: "branches", // collection name for Branch
          localField: "branchId",
          foreignField: "_id",
          as: "branchDetails",
        },
      },
      {
        $unwind: {
          path: "$branchDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // ---- Lookup Customer ----
      {
        $lookup: {
          from: "customers", // collection name for Customer
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: {
          path: "$customerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // ---- Select Fields ----
      {
        $project: {
          _id: 1,
          employeeId: 1,
          appointmentNo: 1,
          serviceName: 1,
          serviceMints: 1,
          price: 1,
          bookingTime: 1,
          serviceCategory: 1,
          bookingDate: 1,
          status: 1,
          employeeName: 1,
          timestamp: 1,

          // Branch fields
          "branchDetails.city": 1,
          "branchDetails.district": 1,
          "branchDetails.firstName": 1,
          "branchDetails.lastName": 1,

          // Customer fields
          "customerDetails.firstName": 1,
          "customerDetails.lastName": 1,
          "customerDetails.email": 1,
          "customerDetails.phone": 1,
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
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    return NextResponse.json(
      {
        message: "All Appointments For Admin",
        status: 200,
        data: appointments,
        pagination: {
          currentPage: page,
          totalPages,
          hasMore,
          totalCount,
        },
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
