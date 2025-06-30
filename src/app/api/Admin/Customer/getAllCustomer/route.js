import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Customer from "../../../../../../models/Customer";
import { corsHeaders } from "../../../../../../libs/corsHeader";

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

    // Step 1: Get total count of matching posts
    const totalCountAgg = await Customer.aggregate([{ $count: "total" }]);
    const total = totalCountAgg[0]?.total || 0;
    // Step 2: Get paginated posts
    const allCustomers = await Customer.find(
      {},
      {
        _id: 1,
        firstName: 1,
        lastName: 1,
        phone: 1,
        // email: 1,
        // city: 1,
        // phone: 1,
        // branchNote: 1,
        // createdAt: 1,
        // updatedAt: 1,
      }
    )
    //   .populate({
    //     path: "createdBy",
    //     select: "fullName email",
    //   })
      .skip(skip)
      .limit(limit);

    // Step 3: Calculate pagination meta
    const has_more = page * limit < total;
    const next_page = has_more ? page + 1 : null;

    return NextResponse.json(
      {
        message: "Customers Retreived Successfully",
        data: allCustomers,
        current_page: page,
        next_page,
        per_page: limit,
        has_more,
      },
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error Fetching Customers", err);
    return NextResponse.json(
      { error: "Error Fetching Customers" },
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
