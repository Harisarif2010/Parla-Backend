import { NextResponse } from "next/server";
import s3 from "../../../../../../libs/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Post from "../../../../../../models/Post";
import { corsHeaders } from "../../../../../../libs/corsHeader";

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

    const formData = await req.formData();
    const title = formData.get("title");
    const imageeFiles = formData.getAll("image"); // ✅ Gets all images
    const role = formData.get("role");
    const description = formData.get("description");

    if (
      title === "" ||
      imageeFiles === "" ||
      role === "" ||
      description === "" ||
      title === ""
    ) {
      return NextResponse.json(
        { error: "Fill Required Fields" },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    let userModel;
    if (role === "admin") {
      userModel = "Admin";
    } else if (role === "branchAdmin") {
      userModel = "Branch";
    }

    const imageUrls = [];

    // imageFiles will be an array of File objects
    for (const imageFile of imageeFiles) {
      // You can convert each File to a buffer or save it as needed
      // ! Store Image in S3
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${imageFile.name}`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName, // optional folder
        Body: buffer,
        ContentType: imageFile.type,
        // ACL: "public-read",
      };

      await s3.send(new PutObjectCommand(params));
      const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      imageUrls.push(imageUrl); // ✅ Add each image URL to array
    }

    const post = {
      title,
      userId: token?.id,
      image: imageUrls,
      description,
      role,
      userModel,
    };

    const newPost = await Post.create(post);
    if (newPost) {
      return NextResponse.json(
        { message: "Post Created Successfully" },
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    console.error("Error Creating Post", err);
    return NextResponse.json(
      { error: "Error Creating Post" },
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
