import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Offer from "../../../../../../models/Offer";

export async function POST(req) {
  await connectMongoDB();

  // const token = await getToken(req);
  // if (!token || token.error) {
  //   return NextResponse.json(
  //     { error: token?.error || "Unauthorized Access" },
  //     { status: 401, headers: corsHeaders }
  //   );
  // }
  const body = await req.json(); // Get the request body
  const {
    branchId,
    name,
    discountType,
    discount,
    limitType,
    quantity,
    repeat,
    code,
    startDate,
    endDate,
    created,
    createdBy,
    createdDate,
  } = body;

  let missingFields = [];
  if (!branchId) {
    missingFields.push("branchId");
  }
  if (!name) {
    missingFields.push("name");
  }
  if (!discountType) {
    missingFields.push("discountType");
  }
  if (!discount) {
    missingFields.push("discount");
  }
  if (!limitType) {
    missingFields.push("limitType");
  }
  if (!quantity) {
    missingFields.push("quantity");
  }
  if (!repeat) {
    missingFields.push("repeat");
  }
  if (!code) {
    missingFields.push("code");
  }
  if (!startDate) {
    missingFields.push("startDate");
  }
  if (!endDate) {
    missingFields.push("endDate");
  }
  if (!created) {
    missingFields.push("created");
  }
  if (!createdBy) {
    missingFields.push("createdBy");
  }
  if (!createdDate) {
    missingFields.push("createdDate");
  }
  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing fields: ${missingFields.join(", ")}` },
      { status: 400, headers: corsHeaders }
    );
  }

  // To Check whether the branch is creating by admin or branch admin
  const addOffer = await Offer.create({ ...body });
  await addOffer.save();
  if (addOffer) {
    return NextResponse.json({
      message: "Offer Added For Branch Successfully",
      data: addOffer,
    });
  } else {
    return NextResponse.json({
      error: "Offer Added Failed. Please Try Again",
    });
  }
}
