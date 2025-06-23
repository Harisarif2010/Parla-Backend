// app/api/flutter-upload/route.js
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectMongoDB from "../../../../../libs/dbConnect";

export async function POST(request) {
  try {
    await connectMongoDB();
    // FormData is natively supported in Next.js 15
    const formData = await request.formData();

    let formFields = {};
    // Loop over the formData entries and map each key-value pair to the formFields object
    formData.forEach((value, key) => {
      formFields[key] = value;
    });

    if (!formFields?.image) {
      return NextResponse.json(
        { error: "Image must required" },
        { status: 400 }
      );
    }
    const dataToValidate = {
      fullName: formFields?.fullName,
      email: formFields?.email,
      password: formFields?.password,
      gender: formFields?.gender,
      // interest,
      // image,
      role: formFields?.role,
      vatId: formFields?.vatId,
      businessName: formFields?.businessName,
      businessAddress: formFields?.businessAddress,
      businessDescription: formFields?.businessDescription,
    };
    const { error } = signupSchema.validate(dataToValidate);
    if (error) {
      console.log(error);
      return NextResponse.json(
        { error: error.details[0].message },
        { status: 400 }
      );
    }

    const existingUser = await Users.findOne({
      email: formFields?.email,
      role: formFields?.role,
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists for this role" },
        { status: 400 }
      );
    }

    const hashP = await hash(formFields?.password.toString(), 10);
    // ! Store Image in S3
    const bytes = await formFields?.image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${formFields?.image.name}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName, // optional folder
      Body: buffer,
      ContentType: formFields?.image.type,
      // ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(params));
    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    const userData = {
      fullName: formFields?.fullName,
      email: formFields?.email,
      password: hashP,
      role: formFields?.role,
      image: imageUrl,
    };

    if (formFields?.role === "people") {
      userData.gender = formFields?.gender;

      if (typeof formFields?.interest === "string") {
        try {
          userData.interest = JSON.parse(formFields?.interest);
        } catch {
          userData.interest = [];
        }
      } else {
        userData.interest = [];
      }
    } else if (formFields?.role === "business") {
      userData.businessName = formFields?.businessName;
      userData.vatId = formFields?.vatId;
      userData.businessAddress = formFields?.businessAddress;
      userData.businessDescription = formFields?.businessDescription;
    }

    // 3. Save the user (you now have _id)
    const newUser = new Users(userData);
    await newUser.save();

    // 4. Generate the JWT using saved user info
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "1d" }
    );

    // 5. Update user document with the token
    newUser.token = token;
    await newUser.save(); // save the updated token field
    return NextResponse.json(
      {
        message: "User created successfully",
        id: newUser?._id,
        isProfileCompleted: newUser?.isProfileCompleted,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing form data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing form data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
