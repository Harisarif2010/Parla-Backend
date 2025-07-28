import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Employee from "../../../../../../models/Employee";
import { corsHeaders } from "../../../../../../libs/corsHeader";

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
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }
    // Check if the customer exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { error: "employee not found" },
        { status: 404 }
      );
    }
    let obj = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      image: employee.image,
    };

    return NextResponse.json(
      {
        message: "Employee Data",
        data: obj,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Error Fetching Employee Data For Chatting", err);
    return NextResponse.json(
      { error: "Error Fetching Employee Data For Chatting" },
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
