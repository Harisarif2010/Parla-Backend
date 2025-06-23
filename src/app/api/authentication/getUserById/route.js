import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import Users from "../../../../../models/Admin";
import { getToken } from "../../../../../libs/getToken";

export async function GET(request) {
  await connectMongoDB();
  const token = await getToken(request);
  if (!token || token.error) {
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      { status: 401 }
    );
  }
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id"); // 👉 "67ff979fb3d771737860b5e1"
  if (!userId) {
    return NextResponse.json(
      { error: "ID is missing in the URL" },
      { status: 400 }
    );
  }
  // Fetch user from DB (example)
  const user = await Users.findById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      message: "Data Fetched Successfully",
      data: {
        id: user?._id,
        isProfileCompleted: user?.isProfileCompleted,
        email: user?.email,
        image: user?.image,
        fullName: user?.fullName,
        isLoggedIn: user?.isLoggedIn,
        interests: user?.interest,
        description: user?.description,
        profilePrivacy: user?.profilePrivacy,
        token: user?.token,
        // followers: user?.followers,
        // following: user?.following,
      },
    },
    { status: 200 }
  );
}
