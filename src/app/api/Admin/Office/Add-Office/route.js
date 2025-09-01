import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../../../../../libs/s3Client";
import Office from "../../../../../../models/Office";

export async function POST(req) {
  try {
    await connectMongoDB();
    const token = await getToken(req);

    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        { status: 401, headers: corsHeaders }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name");
    const type = formData.get("type");
    const authorized = formData.get("authorized");
    const country = formData.get("country");
    const location = formData.get("location");
    const contractDate = formData.get("contractDate");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");
    const duration = formData.get("duration");
    const deposit = formData.get("deposit");
    const price = formData.get("price");
    const rentedFrom = formData.get("rentedFrom");
    const contactPerson = formData.get("contactPerson");
    const contactPersonPhone = formData.get("contactPersonPhone");
    const status = formData.get("status") || "Active";
    const employees = formData.get("employees");
    // Files
    const contract = formData.get("contract");
    const officePhotos = formData.getAll("pictures");

    let missingFields = [];
    if (!name) missingFields.push("name");
    if (!type) missingFields.push("type");
    if (!authorized) missingFields.push("authorized");
    if (!country) missingFields.push("country");
    if (!location) missingFields.push("location");
    if (!contract) missingFields.push("contract");
    if (!contractDate) missingFields.push("contractDate");
    if (!startDate) missingFields.push("startDate");
    if (!endDate) missingFields.push("endDate");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing fields: ${missingFields.join(", ")}` },
        { status: 400, headers: corsHeaders }
      );
    }
  let contractUrl = null;

  if (contract) {
    const bytes = await contract.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${contract.name}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contract.type,
    };

    await s3.send(new PutObjectCommand(params));
    contractUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  }


    const officePhotoBuffers = [];
    for (const imageFile of officePhotos) {
      // You can convert each File to a buffer or save it as needed
      // ! Store Image in S3
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${imageFile.name}`;

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName, // optional folder
        Body: buffer,
        ContentType: imageFile.type,
        // ACL: "public-read",
      };

      await s3.send(new PutObjectCommand(params));
      const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      officePhotoBuffers.push(imageUrl); // ✅ Add each image URL to array
    }

       
   
    const office = await Office.create({
      name,
      type,
      authorized,
      country,
      location: { lat: (location?.lat), lng: (location?.lng) },
      contract: contractUrl, // ⚠️ You may replace with upload URL (S3/IPFS)
      contractDate,
      startDate,
      endDate,
      duration,
      deposit,
      price,
      rentedFrom,
      employees,
      contactPerson,
      contactPersonPhone,
      status,
      officePhoto: officePhotoBuffers, // ⚠️ Same here (better store URLs instead of raw buffer)
    });

    return NextResponse.json(
      { message: "Office Added Successfully", data: office, status: 201, },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Error adding office:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
