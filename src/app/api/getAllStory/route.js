import { NextResponse } from "next/server";
import connectMongoDB from "../../../../libs/dbConnect";
import { getToken } from "../../../../libs/getToken";
import Storys from "../../../../models/Post";

export async function GET(req) {
  try {
    await connectMongoDB();
    // Get The Token
    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        { status: 401 }
      );
    }
    const stories = await Storys.aggregate([
      {
        $project: {
          image: 1,
          userId: 1,
        },
      },
      {
        $lookup: {
          from: "employees", // Replace with the actual collection name for users
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          image: 1,
          user: {
            fullName: "$user.fullName",
            image: "$user.image",
          },
        },
      },
    ]);
      

    return NextResponse.json(
      { message: "Story Created Successfully", data: stories },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error Creating Story", err);
    return NextResponse.json(
      { error: "Error Creating Story" },
      { status: 500 }
    );
  }
}
