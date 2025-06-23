import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { resetPasswordSchema } from "../../../../../validations/authValidation";

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json(); // this reads the ReadableStream internally
    const type = body?.type; // admin , branch , sub-branch , employee (db enum)

    // ! Validate the request body against the Joi
    const { error } = resetPasswordSchema.validate(body);
    // If validation fails, return an error response
    if (error) {
      return NextResponse.json(
        { error: error.details[0].message }, // Extract the error message from Joi
        { status: 400 }
      );
    }
    if (body?.password !== body?.confirmPassword) {
      return NextResponse.json(
        { error: "Password and Confirm Password do not match" },
        { status: 400 }
      );
    }
    // let update = false;
    let hashPassword = await hash(body?.password, 10);
    // Update the user based on email and role
    const update = await Users.updateOne(
      { email: body.email, role: body.role }, // filter
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
        { status: 200 }
      );
    } else {
      // Failed to update password (either document not found or no modification)
      return NextResponse.json(
        {
          message: "Failed to reset password",
        },
        { status: 400 }
      );
    }
  } catch (err) {
    // console.error("Sign-in error:", err);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
