import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongoDB from "../../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../../libs/getToken";
import Offer from "../../../../../../../models/Offer";
import { corsHeaders } from "../../../../../../../libs/corsHeader";

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
    const branchId = searchParams.get("branchId");

    const getOffers = await Offer.aggregate([
      {
        $match: {
          branchId: new mongoose.Types.ObjectId(branchId),
          type: "offer",
        },
      },
      {
        $project: {
          _id: 1,
          startDate: 1,
          endDate: 1,
          discount: 1,
          discountType: 1,
          name: 1,
          code: 1,
          quantity: 1,
          repeat: 1,
          limitType: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    return NextResponse.json(
      {
        message: "All Offers",
        data: getOffers,
      },
      {
        status: 200,
        headers: corsHeaders, // ← Make sure to include CORS headers
      }
    );
  } catch (err) {
    console.error("Error Fetching Offers Data", err);
    return NextResponse.json(
      { error: "Error Fetching Offers Data" },
      {
        status: 500,
        headers: corsHeaders, // ← Make sure to include CORS headers
      }
    );
  }
}

export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
