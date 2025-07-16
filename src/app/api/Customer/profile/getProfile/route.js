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

    const userData = await Customer.findById(token.id).select("firstName lastName image email gender password card phone coupans");

    return NextResponse.json(
      {
        message: "User Data",
        data: userData,
      },
      {
        status: 200,
        headers: corsHeaders, // ← Make sure to include CORS headers
      }
    );
  } catch (err) {
    console.error("Error Fetching Profile Data", err);
    return NextResponse.json(
      { error: "Error Fetching Profile Data" },
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
