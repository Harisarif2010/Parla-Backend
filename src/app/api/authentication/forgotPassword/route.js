import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "../../../../../validations/authValidation";
import Admin from "../../../../../models/Admin";
import ForgotPassword from "../../../../../models/ForgotPassword";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json(); // this reads the ReadableStream internally
    const type = body?.type; // admin , branch , sub-branch , employee (db enum)

    // ! Validate the request body against the Joi
    const { error } = forgotPasswordSchema.validate(body);
    // If validation fails, return an error response
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message }, // Extract the error message from Joi
        { status: 400 }
      );
    }
    // check email based on type
    const isEmail = await Admin.findOne({ email: body?.email });
    if (!isEmail) {
      return NextResponse.json({ error: "Email not exist" }, { status: 401 });
    }
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    let mailResult = await sendOTP(body?.email, randomNumber);
    if (mailResult) {
      const otp = await ForgotPassword.create({
        code: randomNumber,
        email: isEmail.email,
        role: isEmail.role,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
      });
      await otp.save();
    }

    return NextResponse.json(
      {
        data: {
          email: body?.email,
          role: isEmail.role,
        },
        message: mailResult
          ? "Verification Code Sent on Email"
          : "Something Went Wrong. Please Try Again",
      },
      { status: 200 }
    );
  } catch (err) {
    // console.error("Sign-in error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
