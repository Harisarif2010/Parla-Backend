import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Customer from "../../../../../models/Customer";
import { sendNewCustomer } from "../../../../../utils/mailer";
import { hash } from "bcrypt";

function generateRandomPassword(length = 10) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
export async function POST(req) {
  await connectMongoDB();

  const token = await getToken(req);
  if (!token || token.error) {
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      { status: 401 }
    );
  }
  const body = await req.json();
  // Check if the email already exists in the database
  const existingCustomer = await Customer.findOne({ email: body.email });
  if (existingCustomer) {
    return NextResponse.json({
      error: "Email already exists. Please use a different email.",
    });
  }

  const newPassword = generateRandomPassword(); // e.g., "aZ4pQ1tB9d"
  // HASH PASSWORD
  let hashPassword = await hash(newPassword, 10);
  let mailResult = await sendNewCustomer(body?.email, newPassword);
  if (!mailResult) {
    return NextResponse.json({
      error: "Mail Sending Failed. Please Try Again",
    });
  }
  const addCustomer = await Customer.create({
    ...body,
    password: hashPassword,
  });
  await addCustomer.save();
  if (addCustomer) {
    return NextResponse.json({
      message: "Customer Added Successfully",
      data: addCustomer,
    });
  } else {
    return NextResponse.json({
      error: "Customer Added Failed. Please Try Again",
    });
  }
}
