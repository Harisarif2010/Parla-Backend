import { NextResponse } from "next/server";
import s3 from "../../../../../../libs/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
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
          adminPosts: [
            { $match: { userModel: "Admin" } },
            {
              $lookup: {
                from: "admins",
                let: { uid: "$userId" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
                  { $project: { fullName: 1, image: 1, _id: 0 } },
                ],
                as: "user",
              },
            },
          ],
          branchPosts: [
            { $match: { userModel: "Branch" } },
            {
              $lookup: {
                from: "branches",
                let: { uid: "$userId" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$uid"] } } },
                  { $project: { fullName: 1, image: 1, _id: 0 } },
                ],
                as: "user",
              },
            },
          ],
        },
      },
      {
        $project: {
          allPosts: { $concatArrays: ["$adminPosts", "$branchPosts"] },
        },
      },
      { $unwind: "$allPosts" },
      { $replaceRoot: { newRoot: "$allPosts" } },

      // ✅ Pagination
      { $skip: skip },
      { $limit: limit },
    ]);
      

    return NextResponse.json(
      { message: "Posts Retreived Successfully", data: posts },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error Fetching Post", err);
    return NextResponse.json({ error: "Error Fetching Post" }, { status: 500 });
  }
}
