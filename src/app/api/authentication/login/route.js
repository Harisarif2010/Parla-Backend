import { NextResponse } from "next/server";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import connectMongoDB from "../../../../../libs/dbConnect";
import { loginSchema } from "../../../../../validations/authValidation";
import Admin from "../../../../../models/Admin";
import Customer from "../../../../../models/Customer";
import Employee from "../../../../../models/Employee";
import Branch from "../../../../../models/Branch";
import { corsHeaders } from "../../../../../libs/corsHeader";

export async function POST(req) {
  await connectMongoDB();
  try {
    const body = await req.json();
    const { email, password, role } = body;

    // Validate the request body against the Joi schema
    const { error } = loginSchema.validate({ email, password, role });

    // If validation fails, return an error response
    if (error) {
      return NextResponse.json(
        {
          error: error.details[0].message,
        },
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine which model to use based on role
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

    // Check if the user exists
    const checkUser = await UserModel.findOne({
      email,
    });

    if (!checkUser) {
      return NextResponse.json(
        { error: "Invalid email" },
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    const isPasswordCorrect = await compare(password, checkUser?.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Invalid password" },
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = jwt.sign(
      {
        id: checkUser._id,
        email: checkUser.email,
        role,
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "1d" }
    );
    checkUser.token = token;
    await checkUser.save();

    return NextResponse.json(
      {
        message: "Login Successful",
        token: checkUser.token,
        data: {
          role,
          id: checkUser._id,
        },
      },
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Invalid request", details: error.message },
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
