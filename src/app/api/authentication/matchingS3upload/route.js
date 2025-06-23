import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../../../../libs/s3Client";
import Users from "../../../../../models/Admin";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";

export async function POST(request) {
  try {
    await connectMongoDB();
    const token = await getToken(request);
   if (!token || token.error) {
     return NextResponse.json(
       { error: token?.error || "Unauthorized Access" },
       { status: 401 }
     );
   }

    // FormData is natively supported in Next.js 15
    const formData = await request.formData(); // matchingMedia = { image: ["File" , "File"], video: File } id = 1

    let formFields = {};
    formData.forEach((value, key) => {
      // Handle multiple images
      if (formFields[key]) {
        if (Array.isArray(formFields[key])) {
          formFields[key].push(value);
        } else {
          formFields[key] = [formFields[key], value];
        }
      } else {
        formFields[key] = value;
      }
    });
    const uploadedImageUrls = [];

    if (formFields.image && Array.isArray(formFields.image)) {
      for (const file of formFields.image) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${file.name}`;

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
        };

        await s3.send(new PutObjectCommand(params));

        uploadedImageUrls.push(
          `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
        );
      }
    }
    // Upload single video
    let videoUrl = "";
    if (formData?.video === "") {
      videoUrl = "";
    }
    if (formFields.video) {
      const videoBytes = await formFields.video.arrayBuffer();
      const videoBuffer = Buffer.from(videoBytes);
      const videoFileName = `${Date.now()}-${formFields.video.name}`;

      const videoParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: videoFileName,
        Body: videoBuffer,
        ContentType: formFields.video.type,
      };

      await s3.send(new PutObjectCommand(videoParams));

      videoUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/posts/videos/${videoFileName}`;
    }

    const addData = await Users.findByIdAndUpdate(
      formFields.id,
      {
        $set: {
          isProfileCompleted: true,
          matchingMedia: {
            image: uploadedImageUrls,
            video: videoUrl,
          },
        },
      },
      { new: true }
    );
    if (!addData) {
      return NextResponse.json(
        { message: "Data Not Updated In the User Collection" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Media Upload successful",
      },
      {
        isProfileCompleted: addData?.isProfileCompleted,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Upload Matching Media error:", err);
    return NextResponse.json(
      { error: "Failed to upload matching media" },
      { status: 500 }
    );
  }
}
