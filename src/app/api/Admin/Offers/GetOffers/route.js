import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Offer from "../../../../../../models/Offer";

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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // ✅ Get total count first
    const total = await Offer.countDocuments({});

    // ✅ Apply pagination with skip + limit
    const allOffers = await Offer.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // optional: sort by latest

    // ✅ Pagination meta
    const has_more = page * limit < total;
    const next_page = has_more ? page + 1 : null;
    const total_pages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        message: "General Offers Retrieved Successfully",
        data: allOffers,
        status: 200,
        pagination: {
          current_page: page,
          per_page: limit,
          total_items: total,
          total_pages,
          next_page,
          has_more,
        },
      },
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error Fetching Post", err);
    return NextResponse.json(
      { error: "Error Fetching Post" },
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
