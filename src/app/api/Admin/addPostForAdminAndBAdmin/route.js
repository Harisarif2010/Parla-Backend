import { NextResponse } from "next/server";
import s3 from "../../../../../libs/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Post from "../../../../../models/Post";

export async function POST(req) {
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
      
    const formData = await req.formData();
    const image = formData.get("image"); // image
    // const user = await Users.findById(token?.id);
    // if (!user) {
    //   return NextResponse.json(
    //     { error: "User not found. Can't Upload Story" },
    //     { status: 404 }
    //   );
    // }

    // ! Store Image in S3
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${image.name}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName, // optional folder
      Body: buffer,
      ContentType: image.type,
      // ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(params));
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    const post = {
      userId: token?.id,
      image: imageUrl,
    };

    const newPost = await Post.create(post);
    if (newPost) {
      return NextResponse.json(
        { message: "Post Created Successfully" },
        { status: 201 }
      );
    }
  } catch (err) {
    console.error("Error Creating Post", err);
    return NextResponse.json(
      { error: "Error Creating Post" },
      { status: 500 }
    );
  }
}
