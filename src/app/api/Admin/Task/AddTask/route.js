import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../../../../../libs/s3Client";
import Task from "../../../../../../models/Task";
import TaskNotification from "../../../../../../models/TaskNotification";
import mongoose from "mongoose";

export async function POST(req) {
  await connectMongoDB();

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

  // const title = formData.get("title");
  const taskName = formData.get("taskName");
  const description = formData.get("description");
  const assignedBy = formData.get("assignedBy");
  // const titleName = formData.get("titleName");
  const dueDate = formData.get("dueDate");
  const assigner = formData.get("assigner");
  const message = formData.get("message");
  const media = formData.get("media");
  let taskVisibility = formData.getAll("taskVisibility");

  const fields = [];
  // if (!title) {
  //   fields.push("title");
  // }
  if (!taskName) {
    fields.push("taskName");
  }
  if (!description) {
    fields.push("description");
  }
  if (!assignedBy) {
    fields.push("assignedBy");
  }
  // if (!titleName) {
  //   fields.push("titleName");
  // }
  if (!dueDate) {
    fields.push("dueDate");
  }
  if (!taskVisibility || taskVisibility.length === 0) {
    fields.push("taskVisibility");
  }
  if (!assigner) {
    fields.push("assigner");
  }
  // if (!message) {
  //   fields.push("message");
  // }

  if (fields.length > 0) {
    return NextResponse.json(
      { error: `All Fields Are Required: ${fields.join(", ")}` },
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  if (
    Array.isArray(taskVisibility) &&
    taskVisibility.length === 1 &&
    typeof taskVisibility[0] === "string"
  ) {
    taskVisibility = taskVisibility[0].split(",");
  }

  try {
    let imageUrl = null;
    if (media) {
      // Upload the image to S3
      const bytes = await media.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${media.name}`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName, // optional folder
        Body: buffer,
        ContentType: media.type,
        // ACL: "public-read",
      };

      await s3.send(new PutObjectCommand(params));
      imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    }

    const addTask = await Task.create({
      // title,
      taskName,
      description,
      assignedBy,
      // titleName,
      dueDate: new Date(dueDate),
      taskVisibility: taskVisibility,
      assigner,
      message: "Hello",
      media: imageUrl || null, // Store the image URL if available
    });
    await addTask.save();
    // Create ONE notification for all employees in taskVisibility
    const notification = {
      title: `New Task Assigned`,
      message: "You have been assigned a new task",
      role: "Admin",
      createdBy: {
        role: "Admin",
        user: new mongoose.Types.ObjectId("6821df765c60cf3a0c7098e1"),
      },
      recipients: taskVisibility.map((empId) => ({
        user: new mongoose.Types.ObjectId(empId),
        role: "Employee",
        isRead: false,
      })),
    };

    // Save single notification
    await TaskNotification.create(notification);

    return NextResponse.json(
      { message: "Task Added Successfully", status: 201 },
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add task" },
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
