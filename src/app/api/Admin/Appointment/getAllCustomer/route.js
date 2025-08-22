import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Customer from "../../../../../../models/Customer";
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
    const letter = searchParams.get("letter");
    const search = searchParams.get("search");

   let query = {};

   if (letter && letter !== "undefined" && letter !== "null") {
     const regex = new RegExp(`^${letter}`, "i");
     query.$or = [{ firstName: regex }, { lastName: regex }];
   } else if (search && search !== "undefined" && search !== "null") {
     // ✅ search anywhere in name
     const regex = new RegExp(search, "i");
     query.$or = [{ firstName: regex }, { lastName: regex }];
   }

    const allCustomer = await Customer.find(query)
      .select("firstName lastName image email _id")
      .skip((page - 1) * limit)
      .limit(limit);

    const totalCount = await Customer.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return NextResponse.json(
      {
        message: letter
          ? "Filtered by Letter"
          : search
          ? "Search Results"
          : "All Customers",
        data: allCustomer,
        status: 200,
        pagination: {
          currentPage: page,
          totalPages,
          hasMore,
          totalCount,
        },
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("Error Fetching All Customers", err);
    return NextResponse.json(
      { error: "Error Fetching All Customers" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
