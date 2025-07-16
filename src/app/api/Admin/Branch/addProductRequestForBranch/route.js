import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Product from "../../../../../../models/Product"; // Make sure Product model is imported

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

  const {
    type,
    category,
    title,
    productName,
    productBrand,
    productCode,
    branchId,
    gender,
    inventory,
    purchaseQuantity,
    warningAlert,
    purchasePricePerPiece,
    creationBy,
    creationDate,
    explanation,
    status,
  } = body;

  if (type === "request") {
    if (
      !title ||
      !category ||
      !branchId ||
      !productName ||
      !productBrand ||
      !productCode ||
      !gender ||
      !inventory ||
      !purchaseQuantity ||
      !warningAlert ||
      !purchasePricePerPiece ||
      !creationBy ||
      !creationDate ||
      !explanation ||
      !status
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400, headers: corsHeaders }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Invalid request type" },
      { status: 400, headers: corsHeaders }
    );
  }

  const addProduct = await Product.create({
    type,
    title,
    category,
    branchId,
    productName,
    productBrand,
    productCode,
    gender,
    inventory,
    purchaseQuantity,
    warningAlert,
    purchasePricePerPiece,
    creationBy,
    creationDate,
    explanation,
    status,
  });

  if (addProduct) {
    return NextResponse.json(
      {
        message: "Request For Product Added Successfully",
        data: addProduct,
      },
      { status: 200, headers: corsHeaders }
    );
  } else {
    return NextResponse.json(
      { error: "Request For Product Added Failed. Please Try Again" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
