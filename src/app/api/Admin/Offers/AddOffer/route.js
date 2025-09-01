import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Offer from "../../../../../../models/Offer";
import mongoose from "mongoose";
import TaskNotification from "../../../../../../models/TaskNotification";

export async function POST(req) {
  await connectMongoDB();
  const token = await getToken(req);
  if (!token || token.error) {
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      { status: 401, headers: corsHeaders }
    );
  }
  const body = await req.json(); // Get the request body
  let {
    country,
    city,
    category,
    // language,
    name,
    discountType,
    discount,
    limitType,
    code,
    repeat,
    quantity,
    startDate,
    endDate,
    createdBy,
  } = body;
  // transform if they are objects
  country = country?.label || country;
  city = city?.label || city;
  category = category?.value || category;

  const branchIds = body?.branch?.map((b) => b.value);

  let missingFields = [];
  if (!branchIds) {
    missingFields.push("branchId");
  }
  if (!category) {
    missingFields.push("category");
  }
  if (!name) {
    missingFields.push("name");
  }
  if (!discountType) {
    missingFields.push("discountType");
  }
  if (!discount) {
    missingFields.push("discount");
  }
  if (!limitType) {
    missingFields.push("limitType");
  }
  if (!code) {
    missingFields.push("code");
  }
  if (!startDate) {
    missingFields.push("startDate");
  }
  if (!endDate) {
    missingFields.push("endDate");
  }
  if (!createdBy) {
    missingFields.push("createdBy");
  }
  if (!repeat) {
    missingFields.push("repeat");
  }
  if (!quantity) {
    missingFields.push("quantity");
  }

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing fields: ${missingFields.join(", ")}` },
      { status: 400, headers: corsHeaders }
    );
  }

  // To Check whether the branch is creating by admin or branch admin
  const addOffer = await Offer.create({
    ...body,
    branchId: branchIds,
    country,
    city,
    category,
  });
  await addOffer.save();

  // ✅ Create Task Notification after Offer creation
  if (addOffer) {
    const notification = {
      title: "New Offer Created",
      message: `A new offer "${addOffer.name}" has been created with code ${addOffer.code}.`,
      role: "Admin", // Offer created by Admin
      createdBy: {
        role: "Admin",
        user: new mongoose.Types.ObjectId(token?.id), // the admin/branch admin creating the offer
      },
      recipients: branchIds.map((branchId) => ({
        user: new mongoose.Types.ObjectId(branchId), // Or map to employees of this branch
        role: "Branch",
        isRead: false,
      })),
    };

    await TaskNotification.create(notification);

    return NextResponse.json({
      status: 201,
      message: "Offer Added Successfully & Notification Sent",
      data: addOffer,
    });
  } else {
    return NextResponse.json({
      error: "Offer Added Failed. Please Try Again",
      status: 400,
    });
  }
}

// Handle CORS preflight
export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
