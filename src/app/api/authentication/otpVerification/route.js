import connectMongoDB from "../../../../../libs/dbConnect";
import ForgotPasswords from "../../../../../models/ForgotPassword";
import { NextResponse } from "next/server";
import { otpVerificationSchema } from "../../../../../validations/authValidation";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json(); // this reads the ReadableStream internally

    // ! Validate the request body against the Joi
    const { error } = otpVerificationSchema.validate(body);
    // If validation fails, return an error response
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message }, // Extract the error message from Joi
        { status: 400 }
      );
    }
    // check otp
    const checkOtp = await ForgotPasswords.findOne({
      code: body?.code,
      email: body?.email,
      role: body?.role,
      verified: false,
    });

    if (!checkOtp) {
      return NextResponse.json({ message: "Wrong OTP" }, { status: 401 });
    }
    // return NextResponse.json({ message: "Wrong OTP" }, { status: 401 });

    const currentTime = new Date().getTime();
    const createdTime = checkOtp.createdAt.getTime();
    const timeDifferenceInMinutes = (currentTime - createdTime) / (1000 * 60); // Convert milliseconds to minutes

    if (timeDifferenceInMinutes > 5) {
      return NextResponse.json({ message: "OTP Expired" }, { status: 400 });
    }
    // Step 3: Mark OTP as verified
    checkOtp.verified = true;
    await checkOtp.save();
    return NextResponse.json(
      {
        status: true,
        message: "Otp Verified",
        data: { email: checkOtp.email, role: checkOtp.role },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in OTP Verification", err);
    return NextResponse.json(
      { error: "Error in OTP Verification. Try again later." },
      { status: 500 }
    );
  }
}
