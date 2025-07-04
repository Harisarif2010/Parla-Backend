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
  const type = formData.get("type");
  const password = formData.get("password");
  const otp = formData.get("otp");
  const lat = parseFloat(formData.get("lat"));
  const long = parseFloat(formData.get("long"));
  const address = formData.get("address");
  const missingFields = [];

  if (!firstName) missingFields.push("firstName");
  if (!lastName) missingFields.push("lastName");
  if (!image) missingFields.push("image");
  if (!email) missingFields.push("email");
  if (!city) missingFields.push("city");
  if (!phone) missingFields.push("phone");
  if (!branchNote) missingFields.push("branchNote");
  if (!branchId) missingFields.push("branchId");
  if (!createdBy) missingFields.push("createdBy");
  if (!lat) missingFields.push("lat");
  if (!long) missingFields.push("long");
  if (!createdByModel) missingFields.push("createdByModel");
  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        error: "Missing required fields",
        missing: missingFields,
      },
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  if (type === "verifyEmail") {
    if (!password || !otp) {
      return NextResponse.json(
        { error: "Password And OTP are required" },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // check otp
    const checkOtp = await VerifyOtpForNewCustomer.findOne({
      code: parseInt(otp),
      email: email.trim(),
      password: password.trim(),
      verified: false,
    });

    if (!checkOtp) {
      return NextResponse.json(
        { message: "Wrong OTP Or Password" },
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const currentTime = new Date().getTime();
    const createdTime = checkOtp.createdAt.getTime();
    const timeDifferenceInMinutes = (currentTime - createdTime) / (1000 * 60); // Convert milliseconds to minutes

    if (timeDifferenceInMinutes > 5) {
      return NextResponse.json(
        { message: "OTP Expired" },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    // Step 3: Mark OTP as verified
    checkOtp.verified = true;
    await checkOtp.save();
    let Model;
    if (createdByModel === "admin") {
      Model = "Admin";
    } else {
      Model = "Branch";
    }
    const hashP = await hash(password, 10);
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
    const location = {
      type: "Point",
      coordinates: [lat, long], // ⚠️ order: [longitude, latitude]
      address,
    };
    const addCustomer = await Customer.create({
      firstName,
      lastName,
      email,
      city,
      phone,
      branchId,
      branchNote,
      createdBy,
      createdByModel: Model,
      location,
      password: hashP,
      image: imageUrl,
    });
    return NextResponse.json(
      { message: "Customer Added Successfully", data: addCustomer },
      { status: 200, headers: corsHeaders }
    );
  }

  // Check if the email already exists
  const existingCustomer = await Customer.findOne({ email });
  if (existingCustomer) {
    return NextResponse.json(
      { error: "Customer with this email already exists" },
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  // Generate Password For Customer
  const randomOtp = Math.floor(1000 + Math.random() * 9000); // 1000–9999
  const randomPassword = Math.random().toString(36).slice(-8);

  let mailResult = false;
  let mailResult2 = false;
  try {
    mailResult = await sendOTPForCustomerAddition(email, randomOtp);
    mailResult2 = await sendPasswordToNewCustomer(email, randomPassword);
    // Save OTP to database
    const otp = new VerifyOtpForNewCustomer({
      // ✅ Using 'new' keyword (create() already saves)
      code: randomOtp,
      email: email,
      password: randomPassword,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
    });
    await otp.save();
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Email Error:", error);
  }

  if (!mailResult || !mailResult2) {
    return NextResponse.json(
      { error: "Failed to send email to customer." },
      { status: 500, headers: corsHeaders }
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
