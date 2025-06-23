import { NextResponse } from "next/server";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import connectMongoDB from "../../../../../libs/dbConnect";
import { loginSchemaAdmin } from "../../../../../validations/authValidation";
import Admin from "../../../../../models/Admin";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json(); // this reads the ReadableStream internally

    // ! Validate the request body against the Joi
    const { error } = loginSchemaAdmin.validate(body);
    // If validation fails, return an error responses
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message }, // Extract the error message from Joist error object
        { status: 400 }
      );
    }
    // Check if the user exists
    const checkUser = await Admin.findOne({
      email: body?.email,
    });
    if (!checkUser) {
      return NextResponse.json({ error: "Invalid email" }, { status: 401 });
    }
    // ! Comapre the password
    const isPasswordCorrect = await compare(
      body?.password.toString(),
      checkUser.password
    );

    if (!isPasswordCorrect) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    // 4. Generate the JWT using saved user info
    const token = jwt.sign(
      {
        id: checkUser._id,
        email: checkUser.email,
        role: "admin",
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "1d" }
    );
    // 5. Update user document with the token
    checkUser.token = token;
    await checkUser.save(); // save the updated token field

    return NextResponse.json(
      {
        message: "Login Successful",
        data: {
          token: checkUser?.token,
          role: checkUser?.role,
          id: checkUser?._id,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    // console.error("Error In Login API", err);
    return NextResponse.json(
      { error: "Error In Login API. Try Again" },
      { status: 500 }
    );
  }
}
