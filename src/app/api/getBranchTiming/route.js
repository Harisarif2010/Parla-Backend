import { NextResponse } from "next/server";
import connectMongoDB from "../../../../libs/dbConnect";
import { getToken } from "../../../../libs/getToken";
import Employee from "../../../../models/Employee";
import Branch from "../../../../models/Branch";

export async function GET(req) {
  try {
    await connectMongoDB();

    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    const searchInEmployee = await Employee.findOne({ _id: employeeId });
    // Step 2: If created by a branch, get the working_hours of that branch
    let workingHours = null;

    if (
      searchInEmployee.createdByRole === "branch" &&
      searchInEmployee.createdById
    ) {
      const branch = await Branch.findById(searchInEmployee.createdById)
        .select("working_hours")
        .lean();
      workingHours = branch?.working_hours || [];
    }
    return NextResponse.json({
      message: "Working hours retrieved successfully",
      workingHours,
    });
  } catch (error) {
    console.error("Error fetching branch timing:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
