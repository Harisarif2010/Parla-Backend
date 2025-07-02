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
    return NextResponse.json(
      {
        error: "Please Fill All Required Fields",
      },
      { status: 400, headers: corsHeaders }
    );
  }

  // Discount fields check
  if (body?.discount) {
    if (
      !body?.discountPrice ||
      !body?.discountPercentage ||
      !body?.discountStartDate ||
      !body?.discountEndDate
    ) {
      return NextResponse.json(
        {
          error: "Please Fill All Required Fields For Discount",
        },
        { status: 400, headers: corsHeaders }
      );
    }
  }

  // OnlyBetweenTime fields check
  if (body?.onlyBetweenTime) {
    if (!body?.onlyBetweenStartTime || !body?.onlyBetweenEndTime) {
      return NextResponse.json(
        {
          error: "Please Fill All Required Fields For Time Restriction",
        },
        { status: 400, headers: corsHeaders }
      );
    }
  }

  // Create the service
  const addService = await Service.create({ ...body });

  if (addService) {
    return NextResponse.json(
      {
        message: "Service Added For This Branch Successfully",
        data: addService,
      },
      { status: 200, headers: corsHeaders }
    );
  } else {
    return NextResponse.json(
      {
        error: "Service Add Failed. Please Try Again",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
