import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Service from "../../../../../models/Service";

export async function POST(req) {
  await connectMongoDB();

  const token = await getToken(req);
  if (!token || token.error) {
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      { status: 401 }
    );
  }
  const body = await req.json(); // Get the request body

  // To Check whether the branch is creating by admin or branch admin
  const addService = await Service.create(body);
  await addService.save();
  if (addService) {
    return NextResponse.json({
      message: "Service Added For Branch Successfully",
      data: addService,
    });
  } else {
    return NextResponse.json({
      error: "Service Added Failed. Please Try Again",
    });
  }
}
