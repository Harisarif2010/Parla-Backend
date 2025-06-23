import { NextResponse } from "next/server";
import connectMongoDB from "../../../../libs/dbConnect";
import { getToken } from "../../../../libs/getToken";
import Employee from "../../../../models/Employee";

export async function POST(req) {
  await connectMongoDB();

  const token = await getToken(req);
  if (!token || token.error) {
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      { status: 401 }
    );
  }
  const body = await req.json(); // Get the request body

  const addEmployee = await Employee.create(body);
  await addEmployee.save();
  if (addEmployee) {
    return NextResponse.json({
      message: "Employee Added Successfully",
      data: addEmployee,
    });
  } else {
    return NextResponse.json({
      error: "Employee Added Failed. Please Try Again",
    });
  }
}
