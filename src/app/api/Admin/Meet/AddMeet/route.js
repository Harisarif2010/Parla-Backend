import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Meet from "../../../../../../models/Meet";
import TaskNotification from "../../../../../../models/TaskNotification";
import mongoose from "mongoose";

export async function POST(req) {
  await connectMongoDB();

  const token = await getToken(req);
  if (!token || token.error) {
    console.log("❌ Unauthorized access:", token);
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const formData = await req.formData();
  for (let [key, value] of formData.entries()) {
    console.log(`   ${key}:`, value);
  }

  // Extract fields
  let partnerName = formData.get("partnerName");
  let description = formData.get("description");
  let assignedBy = formData.get("assignedBy");
  let taskVisibility = formData.getAll("taskVisibility");
  let gender = formData.get("gender");
  let age = formData.get("age");
  let phone = formData.get("phone");
  let datetime = formData.get("datetime");
  let nextMeet = formData.get("nextMeet");
  let address = formData.get("address");
  let location = formData.get("location");
  let purpose = formData.get("purpose");

  // Parse location
  try {
    location = location ? JSON.parse(location) : null;
  } catch (err) {
    location = null;
  }

  // Required field checks
  const fields = [];
  if (!partnerName) fields.push("partnerName");
  if (!description) fields.push("description");
  if (!assignedBy) fields.push("assignedBy");
  if (!taskVisibility || taskVisibility.length === 0)
    fields.push("taskVisibility");
  if (!gender) fields.push("gender");
  if (!age) fields.push("age");
  if (!phone) fields.push("phone");
  if (!datetime) fields.push("datetime");
  if (!nextMeet) fields.push("nextMeet");
  if (!address) fields.push("address");
  if (!location || !location.cordinates) {
    fields.push("location");
  }
  if (!purpose) fields.push("purpose");

  if (fields.length > 0) {
    return NextResponse.json(
      { error: `All Fields Are Required: ${fields.join(", ")}` },
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // If it's coming as a stringified array → parse it
  try {
    taskVisibility = taskVisibility ? JSON.parse(taskVisibility) : [];
  } catch (err) {
    taskVisibility = [];
  }

  // Handle taskVisibility string
  if (
    Array.isArray(taskVisibility) &&
    taskVisibility.length === 1 &&
    typeof taskVisibility[0] === "string"
  ) {
    taskVisibility = taskVisibility[0].split(",");
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
        coordinates: [location.cordinates.lng, location.cordinates.lat],
      },
      purpose,
      status: "Incomplete",
    });


     const notification = {
       title: `New Meet Coming Up`,
       message: "You have a new meet assigned",
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
      { message: "Meet Added Successfully" },
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error while creating meet:", error);
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
