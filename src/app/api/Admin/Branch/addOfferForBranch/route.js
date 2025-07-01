import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Offer from "../../../../../../models/Offer";

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
  const addOffer = await Offer.create(body);
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
