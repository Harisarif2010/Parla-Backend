import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Customer from "../../../../../../models/Customer";
import { hash } from "bcrypt";
import {
  sendOTPForCustomerAddition,
  sendPasswordToNewCustomer,
} from "../../../../../../utils/mailer";
import VerifyOtpForNewCustomer from "../../../../../../models/VerifyOtpForNewCustomer";
import s3 from "../../../../../../libs/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function PATCH(req) {
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

  const customerId = formData.get("customerId"); // required
  if (!customerId) {
    return NextResponse.json(
      { error: "Customer ID is required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const image = formData.get("image");
  const email = formData.get("email");
  const city = formData.get("city");
  const phone = formData.get("phone");
  const branchId = formData.get("branchId");
  const branchNote = formData.get("branchNote");
  const createdBy = formData.get("createdBy");
  const createdByModel = formData.get("createdByModel");
  const lat = parseFloat(formData.get("lat"));
  const long = parseFloat(formData.get("long"));
  const address = formData.get("address");

  const updatedFields = {};

  if (firstName) updatedFields.firstName = firstName;
  if (lastName) updatedFields.lastName = lastName;
  if (email) updatedFields.email = email;
  if (city) updatedFields.city = city;
  if (phone) updatedFields.phone = phone;
  if (branchId) updatedFields.branchId = branchId;
  if (branchNote) updatedFields.branchNote = branchNote;
  if (createdBy) updatedFields.createdBy = createdBy;
  if (createdByModel) updatedFields.createdByModel = createdByModel;

  if (lat && long && address) {
    updatedFields.location = {
      type: "Point",
      coordinates: [long, lat], // longitude, latitude
      address,
    };
  }

  // Handle image upload to S3 (optional)
  if (image && typeof image === "object") {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${image.name}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: image.type,
    };

    await s3.send(new PutObjectCommand(params));
    updatedFields.image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  }

  const updatedCustomer = await Customer.findByIdAndUpdate(
    customerId,
    updatedFields,
    { new: true }
  );

  if (!updatedCustomer) {
    return NextResponse.json(
      { error: "Customer not found or update failed." },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    { message: "Customer updated successfully", data: updatedCustomer },
    { status: 200, headers: corsHeaders }
  );
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
