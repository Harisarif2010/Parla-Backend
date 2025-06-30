import { NextResponse } from "next/server";

export async function POST(req) {
  await connectMongoDB();

  const token = await getToken(req);
  if (!token || token.error) {
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      {
        status: 401,
        headers: corsHeaders,
      }
    );
  }
  const formData = await req.formData();

  const type = formData.get("type");
  const title = formData.get("title");
  const category = formData.get("category");
  const branchId = formData.get("branchId");
  const productName = formData.get("productName");
  const productBrand = formData.get("productBrand");
  const productCode = formData.get("productCode");
  const gender = formData.get("gender");
  const inventory = formData.get("inventory");
  const purchaseQuantity = formData.get("purchaseQuantity");
  const warningAlert = formData.get("warningAlert");
  const purchasePricePerPiece = formData.get("purchasePricePerPiece");
  const purchaseFrom = formData.get("purchaseFrom");
  const purchaseDate = formData.get("purchaseDate");
  const sellPricePerPiece = formData.get("sellPricePerPiece");
  const invoice = formData.get("invoice");
  const discount = formData.get("discount");
  const discountPrice = formData.get("discountPrice");
  const discountStartDate = formData.get("discountStartDate");
  const discountEndDate = formData.get("discountEndDate");

  if (type === "new") {
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
      !purchaseFrom ||
      !purchaseDate ||
      !sellPricePerPiece ||
      !invoice
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
  } else if (type === "inventory") {
    if (
      !title ||
      !category ||
      !branchId ||
      !productName ||
      !productBrand ||
      !productCode ||
      !gender ||
      !inventory ||
      !purchaseQuantity
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
  }

  if (discount === "true") {
    if (!discountPrice || !discountStartDate || !discountEndDate) {
      return NextResponse.json(
        { error: "All fields are required for discount" },
        { status: 400 }
      );
    }
  }

  if (type === "new") {
    // Upload the image to S3
    const bytes = await invoice.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${invoice.name}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName, // optional folder
      Body: buffer,
      ContentType: invoice.type,
      // ACL: "public-read",
    };

    await s3.send(new PutObjectCommand(params));
    const invoiceUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
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
    purchaseFrom,
    purchaseDate,
    sellPricePerPiece,
    invoice: invoiceUrl,
    discount,
    discountPrice,
    discountStartDate,
    discountEndDate,
  });
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

// Handle CORS preflight
export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
