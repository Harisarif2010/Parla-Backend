import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { forgotPasswordSchema } from "../../../../../validations/authValidation";
import Admin from "../../../../../models/Admin";
import Customer from "../../../../../models/Customer";
import Employee from "../../../../../models/Employee";
import Branch from "../../../../../models/Branch";
import ForgotPassword from "../../../../../models/ForgotPassword";
import { corsHeaders } from "../../../../../libs/corsHeader";
import { sendOTP } from "../../../../../utils/mailer";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const { email, role } = body;

    console.log("Request body:", email, role);

    // Validate the request body against the Joi schema
    const { error } = forgotPasswordSchema.validate({ email, role }); // ✅ Added role validation if needed
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Determine which model to use based on role
    let UserModel;
    if (role === "admin") {
      UserModel = Admin;
    } else if (role === "customer") {
      UserModel = Customer;
    } else if (role === "employee") {
      UserModel = Employee;
    } else if (role === "branchAdmin") {
      UserModel = Branch;
    } else {
      return NextResponse.json(
        { error: "Invalid role specified" },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Check email using the correct UserModel based on role
    const isEmail = await UserModel.findOne({ email });
    if (!isEmail) {
      return NextResponse.json(
        { error: "Email does not exist" },
        {
          status: 404, // ✅ Changed to 404 for "not found"
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate 6-digit OTP
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    // Send OTP via email
    let mailResult = await sendOTP(email, randomNumber); // ✅ Using email directly

    if (mailResult) {
      // Save OTP to database
      const otp = new ForgotPassword({
        // ✅ Using 'new' keyword (create() already saves)
        code: randomNumber,
        email: isEmail.email,
        role: role, // ✅ Using role from request
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP expires in 5 minutes
      });
      await otp.save();

      return NextResponse.json(
        {
          data: {
            email: email, // ✅ Using email directly
            role: role,
          },
          message: "Verification Code Sent to Email",
        },
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      return NextResponse.json(
        { error: "Failed to send OTP. Please try again." },
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
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
