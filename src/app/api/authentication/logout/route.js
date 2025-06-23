import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Users from "../../../../../models/Admin";

export async function POST(req) {
  try {
    await connectMongoDB();
    // Get The Token
    const token = await getToken(req);

    if (!token || token.error) {
      console.error("❌ Token Error:", token.error); // 🔥 Shows up in your terminal
      return NextResponse.json({ message: token.error }, { status: 401 });
    }

    await Users.findByIdAndUpdate(token.id, { token: null, isLoggedIn: false });
    return NextResponse.json(
      {
        message: "Logout Successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error In Logout API", err);
    return NextResponse.json(
      { error: "Error In Logout API. Try Again" },
      { status: 500 }
    );
  }
}
