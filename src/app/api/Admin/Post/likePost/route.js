import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import LikesOnPost from "../../../../../../models/LikesOnPost";

export async function POST(req) {
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

    const { postId, likedBy, createdByModels } = await req.json();
    if (!postId || !likedBy || !createdByModels) {
      return NextResponse.json(
        { error: "Missing required fields" },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    let createdByModel;
    if (createdByModels === "admin") {
      createdByModel = "Admin";
    } else if (createdByModels === "branch") {
      createdByModel = "Branch";
    }
    const existingLike = await LikesOnPost.findOne({
      postId,
      createdBy: likedBy,
      createdByModel,
    });
    if (existingLike) {
      return NextResponse.json(
        { error: "Post Already Liked" },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    const addLike = await LikesOnPost.create({
      postId,
      createdBy: likedBy,
      createdByModel,
    });
    if (!addLike) {
      return NextResponse.json(
        { error: "Post Not Liked. Please try again" },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    return NextResponse.json(
      { message: "Post Liked Successfully" },
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error Liked Post", err);
    return NextResponse.json(
      { error: "Error Liked Post" },
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
