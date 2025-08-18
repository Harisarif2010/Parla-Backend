import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Meet from "../../../../../../models/Meet";
import TaskNotification from "../../../../../../models/TaskNotification";
import mongoose from "mongoose";

export async function POST(req) {
  await connectMongoDB();

//   const token = await getToken(req);
//   if (!token || token.error) {
//     return NextResponse.json(
//       { error: token?.error || "Unauthorized Access" },
//       {
//         status: 401,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       }
//     );
//   }
  const {
    partnerName,
    description,
    assignedBy,
    taskVisibility,
    gender,
    age,
    phone,
    datetime,
    nextMeet,
    address,
    location,
    purpose,
  } = await req.json();

  const fields = [];
  if (!partnerName) {
    fields.push("partnerName");
  }
  if (!description) {
    fields.push("description");
  }
  if (!assignedBy) {
    fields.push("assignedBy");
  }
  if (!taskVisibility || taskVisibility.length === 0) {
    fields.push("taskVisibility");
  }
  if (!gender) {
    fields.push("gender");
  }
  if (!age) {
    fields.push("age");
  }

  if (!phone) {
    fields.push("phone");
  }
  if (!datetime) {
    fields.push("datetime");
  }
  if (!nextMeet) {
    fields.push("nextMeet");
  }
  if (!address) {
    fields.push("address");
  }
  if (!location || !location.coordinates || location.coordinates.length !== 2) {
    fields.push("location");
  }
  if (!purpose) {
    fields.push("purpose");
  }
  if (fields.length > 0) {
    return NextResponse.json(
      { error: `All Fields Are Required: ${fields.join(", ")}` },
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    }
  try {
    const addMeet = await Meet.create({
      partnerName,
      description,
      assignedBy,
      taskVisibility,
      gender,
      age,
      phone,
      datetime: new Date(datetime),
      nextMeet: new Date(nextMeet),
      address,
      location: {
        type: "Point",
        coordinates: location.coordinates,  
      },
      purpose,
      status: "Incomplete",
    });
    await addMeet.save();
    // Create notifications for each employee in taskVisibility
    const notifications = taskVisibility.map((empId) => ({
      title: `New Meet Coming Up`,
      message: "You have a new meet assigned",
      data: { meetId: addMeet._id },
      role: "Admin",
      createdBy: new mongoose.Types.ObjectId("6821df765c60cf3a0c7098e1"),
      recipient: new mongoose.Types.ObjectId(empId),
      isRead: false,
    }));

    await TaskNotification.insertMany(notifications);

    return NextResponse.json(
      { message: "Meet Added Successfully" },
      {
        status: 201,
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
