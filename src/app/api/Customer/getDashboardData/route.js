import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import { corsHeaders } from "../../../../../libs/corsHeader";
import Customer from "../../../../../models/Customer";
import Employee from "../../../../../models/Employee";

export async function GET(req) {
  try {
    await connectMongoDB();
    // Get The Token
    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        { status: 401, headers: corsHeaders }
      );
    }
    const customerId = token?.id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 10;
    const page = parseInt(searchParams.get("page")) || 1;

    const type = searchParams.get("type");
    const gender = searchParams.get("gender");

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }
    // Check if the customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const getEmployees = await Employee.aggregate([
      {
        $match: {
          serviceType: type,
          gender: gender,
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
          createdAt: -1,
        },
      },
    ]);
    return NextResponse.json(
      {
        message: "Dashboard Data",
        data: getEmployees,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error Fetching Dashboard Data", err);
    return NextResponse.json(
      { error: "Error Fetching Dashboard Data" },
      { status: 500 }
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

