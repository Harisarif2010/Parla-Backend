import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Branch from "../../../../../../models/Branch";

export async function GET(req) {
  try {
    await connectMongoDB();
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
    const country = searchParams.get("country");
    const city = searchParams.get("city");

    if (!country || !city) {
      return NextResponse.json(
        { error: "Country and City are required" },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const normalize = (str) => {
      if (!str) return "";
      return str.trim().replace(/\s+/g, " "); // remove extra spaces
    };

    const countryQuery = normalize(country);
    const cityQuery = normalize(city);

    const branches = await Branch.find({
      ...(countryQuery && {
        country: { $regex: new RegExp(countryQuery, "i") },
      }),
      ...(cityQuery && { city: { $regex: new RegExp(cityQuery, "i") } }),
    }).select("branchName category firstName lastName");

    return NextResponse.json(
      {
        message: "Departments fetched successfully",
        data: branches,
      },
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error fetching departments", err);
    return NextResponse.json(
      { error: "Error fetching departments" },
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
