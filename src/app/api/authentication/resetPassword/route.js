import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { resetPasswordSchema } from "../../../../../validations/authValidation";
import Admin from "../../../../../models/Admin";
import Customer from "../../../../../models/Customer";
import Employee from "../../../../../models/Employee";
import Branch from "../../../../../models/Branch";
import { corsHeaders } from "../../../../../libs/corsHeader";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json(); // this reads the ReadableStream internally
    const { emails, password, confirmPassword, role } = body;
    const email = emails;

    // ! Validate the request body against the Joi
    const { error } = resetPasswordSchema.validate({
      email,
      password,
      confirmPassword,
      role,
    });
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message }, // Extract the error message from Joi
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password and Confirm Password do not match" },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    let hashPassword = await hash(password, 10);
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
    // Update the user based on email and role
    const update = await UserModel.updateOne(
      { email, role }, // filter
      { password: hashPassword } // update
    );

    if (
      update?.acknowledged &&
      update.modifiedCount === 1 &&
      update.matchedCount === 1
    ) {
      // Password successfully updated
      return NextResponse.json(
        { message: "Password Updated" },
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // Failed to update password (either document not found or no modification)
      return NextResponse.json(
        {
          message: "Failed to reset password",
        },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    // console.error("Sign-in error:", err);
    return NextResponse.json(
      { error: "Failed to reset password" },
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

