import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Customer from "../../../../../../models/Customer";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectMongoDB();
    // Get The Token
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
    const customerId = (searchParams.get("customerId"));
  
    const customerData = await Customer.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(customerId),
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          image: 1,
          city: 1,
          createdBy: 1,
          createdByModel: 1,
          location: {
            type: "$location.type",
            coordinates: "$location.coordinates",
            address: "$location.address",
          },
        },
      },
    ]);
    

    return NextResponse.json(
      {
        message: "Customer Data Retreived Successfully",
        data: customerData,
      },
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error Fetching Customer Data", err);
    return NextResponse.json(
      { error: "Error Fetching Customer Data" },
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
