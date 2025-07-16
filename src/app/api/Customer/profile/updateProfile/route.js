import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Customer from "../../../../../../models/Customer";

export async function PATCH(req) { 
  try {
    await connectMongoDB();

    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json();

    // Fields you allow user to update
    const updatableFields = [
      "firstName",
      "lastName",
      "image",
      "email",
      "gender",
      "card",
      "phone",
      "coupans",
    ];

    // Build update object from allowed fields
    const updateData = {};
    for (const key of updatableFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    // Update the customer data
    const updatedUser = await Customer.findByIdAndUpdate(token.id, updateData, {
      new: true, // return the updated document
    }).select("firstName lastName image email gender card phone coupans");

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        data: updatedUser,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err) {
    console.error("Error updating profile", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      {
        status: 500,
        headers: corsHeaders,
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
