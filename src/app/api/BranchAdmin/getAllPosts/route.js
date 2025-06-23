import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Post from "../../../../../models/Post";

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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const posts = await Post.aggregate([
      {
        $facet: {
          admins: [
            { $match: { userModel: "Admin" } },
            {
              $lookup: {
                from: "admins",
                localField: "userId",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: "$user" },
          ],
          branches: [
            { $match: { userModel: "Branch" } },
            {
              $lookup: {
                from: "branches",
                localField: "userId",
                foreignField: "_id",
                as: "user",
              },
            },
            { $unwind: "$user" },
          ],
        },
      },
      {
        $project: {
          data: {
            $concatArrays: ["$admins", "$branches"],
          },
        },
      },
      { $unwind: "$data" },
      {
        $replaceRoot: { newRoot: "$data" },
      },
      {
        $sort: { createdAt: -1 }, // Optional: sort by newest
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          image: 1,
          userId: 1,
          userModel: 1,
          createdAt: 1,
          updatedAt: 1,
          "user.fullName": 1,
          "user.image": 1,
        },
      },
    ]);
    return NextResponse.json(
      { message: "Posts Retreived Successfully", data: posts },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error Getting All Posts", err);
    return NextResponse.json(
      { error: "Error Getting All Posts" },
      { status: 500 }
    );
  }
}
