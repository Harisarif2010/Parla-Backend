import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import Branch from "../../../../../../models/Branch";
import s3 from "../../../../../../libs/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";

export async function POST(req) {
  await connectMongoDB();

  const token = await getToken(req);
  if (!token || token.error) {
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  const formData = await req.formData();

  const firstName = formData.get("firstName");
  const branchName = formData.get("branchName");
  const userName = formData.get("userName");
  const password = formData.get("password");
  const title = formData.get("title");
  const image = formData.get("image");
  const vat = formData.get("vat");
  const textAdministration = formData.get("textAdministration");
  const category = formData.get("category");
  const taxPlate = formData.get("taxPlate");
  const registration = formData.get("registration");
  const license = formData.get("license");
  const certificate = formData.get("certificate");
  const paymentMethod = formData.get("paymentMethod");
  const freeCancelBefore = formData.get("freeCancelBefore");
  const country = formData.get("country");
  const city = formData.get("city");
  const district = formData.get("district");
  const town = formData.get("town");
  const street = formData.get("street");
  const streetNo = formData.get("streetNo");
  const createdDate = formData.get("createdDate");
  const lat = parseFloat(formData.get("lat"));
  const long = parseFloat(formData.get("long"));
  const address = formData.get("address");
  const authorizedName = formData.get("authorizedName");
  const phone = formData.get("phone");
  const branchPhone = formData.get("branchPhone");
  const branchEmail = formData.get("branchEmail");
  const workingHoursRaw = JSON.parse(formData.get("workingHours"));
  const createdByModels = formData.get("createdByModels");
  const createdBy = formData.get("createdBy");

  if (
    !firstName ||
    !branchName ||
    !userName ||
    !password ||
    !title ||
    !image ||
    !vat ||
    !textAdministration ||
    !category ||
    !taxPlate ||
    !registration ||
    !license ||
    !certificate ||
    !paymentMethod ||
    !freeCancelBefore ||
    !country ||
    !city ||
    !district ||
    !town ||
    !street ||
    !streetNo ||
    !createdDate ||
    !lat ||
    !long ||
    !address ||
    !authorizedName ||
    !phone ||
    !branchPhone ||
    !branchEmail ||
    !workingHoursRaw ||
    !createdByModels ||
    !createdBy
  ) {
    return NextResponse.json(
      { error: "All Fields Are Required" },
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  // Check if the email already exists
  const existingBranch = await Branch.findOne({ branchEmail });
  if (existingBranch) {
    return NextResponse.json(
      { error: "Branch with this email already exists" },
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Upload the image to S3
  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}-${image.name}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName, // optional folder
    Body: buffer,
    ContentType: image.type,
    // ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(params));
  const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  // Upload the Text Plate to S3
  const bytesTax = await taxPlate.arrayBuffer();
  const bufferTax = Buffer.from(bytesTax);
  const fileNameTax = `${Date.now()}-${taxPlate.name}`;

  const paramsTax = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileNameTax, // optional folder
    Body: bufferTax,
    ContentType: taxPlate.type,
    // ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(paramsTax));
  const taxPlateUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileNameTax}`;
  // Upload the Registration to S3
  const bytesRegistration = await registration.arrayBuffer();
  const bufferRegistration = Buffer.from(bytesRegistration);
  const fileNameRegistration = `${Date.now()}-${registration.name}`;
  const paramsRegistration = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileNameRegistration, // optional folder
    Body: bufferRegistration,
    ContentType: registration.type,
    // ACL: "public-read",
  };
  await s3.send(new PutObjectCommand(paramsRegistration));
  const registrationUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileNameRegistration}`;
  // Upload the License to S3
  const bytesLicense = await license.arrayBuffer();
  const bufferLicense = Buffer.from(bytesLicense);
  const fileNameLicense = `${Date.now()}-${license.name}`;
  const paramsLicense = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileNameLicense, // optional folder
    Body: bufferLicense,
    ContentType: license.type,
    // ACL: "public-reac,
  };
  await s3.send(new PutObjectCommand(paramsLicense));
  const licenseUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileNameLicense}`;
  // Upload the Certificate to S3
  const bytesCertificate = await certificate.arrayBuffer();
  const bufferCertificate = Buffer.from(bytesCertificate);
  const fileNameCertificate = `${Date.now()}-${certificate.name}`;
  const paramsCertificate = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileNameCertificate, // optional folder
    Body: bufferCertificate,
    ContentType: certificate.type,
    // ACL: "public-read",
  };
  await s3.send(new PutObjectCommand(paramsCertificate));
  const certificateUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileNameCertificate}`;
  const location = {
    type: "Point",
    coordinates: [lat, long], // ⚠️ order: [latitude,longitude ]
    address,
  };
  const workingHours = workingHoursRaw.map((entry) => ({
    day: entry.day,
    from: entry.from,
    to: entry.to,
  }));
  
  let createdByModel;
  if (createdByModels === "admin") {
    createdByModel = "Admin";
  } else if (createdByModels === "branch") {
    createdByModel = "Branch";
  }
  const addBranch = await Branch.create({
    firstName,
    branchName,
    userName,
    password,
    title,
    image: imageUrl,
    vat,
    textAdministration,
    category,
    taxPlate: taxPlateUrl,
    registration: registrationUrl,
    license: licenseUrl,
    certificate: certificateUrl,
    paymentMethod,
    freeCancelBefore,
    country,
    city,
    district,
    town,
    street,
    streetNo,
    createdDate,
    location: location,
    authorizedName,
    phone,
    branchPhone,
    branchEmail,
    workingHours,
    createdByModel,
    createdBy,
  });
  await addBranch.save();
  if (addBranch) {
    return NextResponse.json({
      message: "Branch Added Successfully",
      data: addBranch,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } else {
    return NextResponse.json({
      error: "Branch Added Failed. Please Try Again",
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
