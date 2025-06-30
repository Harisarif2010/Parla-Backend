import connectMongoDB from "../../../../../libs/dbConnect";
import ForgotPasswords from "../../../../../models/ForgotPassword";
import { NextResponse } from "next/server";
import { otpVerificationSchema } from "../../../../../validations/authValidation";
import { corsHeaders } from "../../../../../libs/corsHeader";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json(); // this reads the ReadableStream internally
    const { code, emails, role } = body;
    const email = emails;

    // ! Validate the request body against the Joi
    const { error } = otpVerificationSchema.validate({ code, email, role });
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message }, // Extract the error message from Joi
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    // check otp
    const checkOtp = await ForgotPasswords.findOne({
      code: code,
      email: email,
      role,
      verified: false,
    });

    if (!checkOtp) {
      return NextResponse.json(
        { message: "Wrong OTP" },
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    // return NextResponse.json({ message: "Wrong OTP" }, { status: 401 });

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
    return NextResponse.json(
      {
        status: true,
        message: "Otp Verified",
        data: { email: checkOtp.email, role: checkOtp.role },
      },
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in OTP Verification", err);
    return NextResponse.json(
      { error: "Error in OTP Verification. Try again later." },
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
