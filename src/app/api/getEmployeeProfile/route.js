import { NextResponse } from "next/server";
import connectMongoDB from "../../../../libs/dbConnect";
import { getToken } from "../../../../libs/getToken";

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
    let match = {
      _id: token.id,
    };
    const userData = await Appointment.aggregate([
      {
        $match: match,
      },
      {
        $project: {
          fullName: 1,
          userName: 1,
          image: 1,
          password: 1,
          email: 1,
          phone: 1,
        },
      },
    ]);

    return NextResponse.json({
      message: "User Detail retrieved successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Error in get user detail:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
