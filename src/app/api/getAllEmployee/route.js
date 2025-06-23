import { NextResponse } from "next/server";
import connectMongoDB from "../../../../libs/dbConnect";
import { getToken } from "../../../../libs/getToken";
import Employee from "../../../../models/Employee";

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
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    if (type !== "") {
      const [employees, total] = await Promise.all([
        Employee.find({category: type})
          .select("fullName image") // Select only required fields
          .skip(skip)
          .limit(limit)
          .lean(), // Faster read-only query
        Employee.countDocuments(),
      ]);
      return NextResponse.json({
        message: "Employees retrieved successfully",
        data: employees,
        totalEmployees: total,
      });
      }
      const [employees, total] = await Promise.all([
        Employee.find({})
          .select("fullName image") // Select only required fields
          .skip(skip)
          .limit(limit)
          .lean(), // Faster read-only query
        Employee.countDocuments(),
      ]);
      return NextResponse.json({
        message: "Employees retrieved successfully",
        data: employees,
        totalEmployees: total,
      });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
