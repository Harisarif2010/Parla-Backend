import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Post from "../../../../../../models/Post";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import LikesOnPost from "../../../../../../models/LikesOnPost";
import Offer from "../../../../../../models/Offer";

export async function GET(req) {
  try {
    await connectMongoDB();
    // Get The Token
    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Step 1: Get total count of matching posts
    const totalCountAgg = await Post.aggregate([
      {
        $match: { userModel: { $in: ["Admin", "Branch"] } },
      },
      { $count: "total" },
    ]);
    const total = totalCountAgg[0]?.total || 0;
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
                  { $project: { fullName: 1, image: 1, _id: 1 } },
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
                  { $project: { fullName: 1, image: 1, _id: 1 } },
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

      // ✅ Lookup liked user IDs for each post
      {
        $lookup: {
          from: "likesonposts",
          let: { postId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
            { $project: { _id: 0, createdBy: 1 } },
          ],
          as: "likedUserIds",
        },
      },

      // ✅ Project fields including likedUserIds
      {
        $project: {
          _id: 1,
          image: 1,
          title: 1,
          description: 1,
          createdAt: 1,
          likedUserIds: {
            $map: {
              input: "$likedUserIds",
              as: "like",
              in: "$$like.createdBy", // ✅ Correct field name
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // Step 3: Calculate pagination meta
    const has_more = page * limit < total;
    const next_page = has_more ? page + 1 : null;

    return NextResponse.json(
      {
        message: "Posts Retreived Successfully",
        data: posts,
        current_page: page,
        next_page,
        per_page: limit,
        has_more,
      },
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error Fetching Post", err);
    return NextResponse.json(
      { error: "Error Fetching Post" },
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
