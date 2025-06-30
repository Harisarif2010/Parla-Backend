import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Post from "../../../../../../models/Post";
import { corsHeaders } from "../../../../../../libs/corsHeader";

export async function DELETE(req) {
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

      const { postId } = await req.json();
      const post = await Post.findByIdAndDelete(postId);
      if (!post) {
          return NextResponse.json(
              { error: "Post not found" },
              {
                  status: 404,
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
              },
            );
      }
      return NextResponse.json(
        { message: "Post deleted successfully" },
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
  } catch (err) {
    console.error("Error Deleting Post", err);
    return NextResponse.json(
      { error: "Error Deleting Post" },
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
