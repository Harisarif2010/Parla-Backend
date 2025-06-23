import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Branch from "../../../../../models/Branch";


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
  const addBranch = await Branch.create(body);
  await addBranch.save();
  if (addBranch) {
    return NextResponse.json({
      message: "Branch Added Successfully",
      data: addBranch,
    });
  } else {
    return NextResponse.json({
      error: "Branch Added Failed. Please Try Again",
    });
  }
}
