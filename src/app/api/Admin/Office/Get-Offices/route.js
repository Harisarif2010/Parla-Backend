import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Office from "../../../../../../models/Office";

export async function GET(req) {
  try {
    await connectMongoDB();

    // ✅ Validate token
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
    // ✅ Extract query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
      const skip = (page - 1) * limit;
   

    // Filters from query params
    const country = searchParams.get("country");
    const city = searchParams.get("city");
    const district = searchParams.get("district");
    const status = searchParams.get("status");
    const search = searchParams.get("search"); // search by name

    // ✅ Build dynamic filter object
    let filter = {};
    if (country) filter.country = country;
    if (city) filter.city = city;
    if (district) filter.district = district;
    // if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: "i" };

    // ✅ Count total
    const total = await Office.countDocuments(filter);

    // ✅ Fetch with pagination
    const allOffices = await Office.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // ✅ Pagination meta
    const has_more = page * limit < total;
    const next_page = has_more ? page + 1 : null;
    const total_pages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        message: "Offices Retrieved Successfully",
        data: allOffices,
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
    console.error("Error Fetching Offices", err);
    return NextResponse.json(
      { error: "Error Fetching Offices" },
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
