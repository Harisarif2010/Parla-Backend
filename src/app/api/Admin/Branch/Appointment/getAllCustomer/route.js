import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../../libs/dbConnect";
import Customer from "../../../../../../../models/Customer";
import { corsHeaders } from "../../../../../../../libs/corsHeader";

export async function GET(req) {
  try {
    await connectMongoDB();
    // const token = await getToken(req);
    // if (!token || token.error) {
    //   return NextResponse.json(
    //     { error: token?.error || "Unauthorized Access" },
    //     { status: 401, headers: corsHeaders  }
    //   );
    // }
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 10;
    const page = parseInt(searchParams.get("page")) || 1;

    const allCustomer = await Customer.find().select(
      "firstName lastName image email _id"
    );
    const totalPages = Math.ceil(allCustomer?.length / limit);
    const hasMore = page < totalPages;
    return NextResponse.json(
      {
        message: "All Customers",
        data: allCustomer,
        pagination: {
          currentPage: page,
          totalPages,
          hasMore,
          totalCount: allCustomer?.length,
        },
      },
      {
        status: 200,
        headers: corsHeaders, // ← Make sure to include CORS headers
      }
    );
  } catch (err) {
    console.error("Error Fetching All Customers", err);
    return NextResponse.json(
      { error: "Error Fetching All Customers" },
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
