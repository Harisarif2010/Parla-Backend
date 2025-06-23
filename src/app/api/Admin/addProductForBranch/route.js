import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import { getToken } from "../../../../../libs/getToken";
import Product from "../../../../../models/Product";


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
  const addProduct = await Product.create(body);
  await addProduct.save();
  if (addProduct) {
    return NextResponse.json({
      message: "Product Added For Branch Successfully",
      data: addProduct,
    });
  } else {
    return NextResponse.json({
      error: "Product Added Failed. Please Try Again",
    });
  }
}
