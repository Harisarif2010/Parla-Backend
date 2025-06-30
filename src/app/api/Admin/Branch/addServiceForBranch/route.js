import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Service from "../../../../../../models/Service";

export async function POST(req) {
  await connectMongoDB();

  const token = await getToken(req);
  if (!token || token.error) {
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      { status: 401, headers: corsHeaders }
    );
  }
  const body = await req.json();

  if (
    !body?.branchId ||
    !body?.category ||
    !body?.title ||
    !body?.serviceName ||
    !body?.serviceMints ||
    !body?.gender ||
    !body?.price
  ) {
    return NextResponse.json({
      error: "Please Fill All Required Fields",
      status: 400,
      headers: corsHeaders,
    });
  }
  const addService = await Service.create({ ...body });
  await addService.save();
  if (addService) {
    return NextResponse.json({
      message: "Service Added For This Branch Successfully",
      data: addService,
      status: 200,
    });
  } else {
    return NextResponse.json({
      error: "Service Added Failed. Please Try Again",
    });
  }
}
