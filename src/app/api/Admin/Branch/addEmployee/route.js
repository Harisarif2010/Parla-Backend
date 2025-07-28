import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../../../../../../libs/s3Client";
import Employee from "../../../../../../models/Employee";
import { formDataSchema } from "../../../../../../validations/authValidation";

export async function POST(req) {
  await connectMongoDB();

  // const token = await getToken(req);
  // if (!token || token.error) {
  //   return NextResponse.json(
  //     { error: token?.error || "Unauthorized Access" },
  //     { status: 401, headers: corsHeaders }
  //   );
  // }
  const formData = await req.formData();

  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const tCNo = formData.get("tCNo");
  const email = formData.get("email");
  const password = formData.get("password");
  const image = formData.get("image");
  const country = formData.get("country");
  const city = formData.get("city");
  const district = formData.get("district");
  const town = formData.get("town");
  const street = formData.get("street");
  const doorNo = formData.get("doorNo");
  const salarayAmount = formData.get("salarayAmount");
  const salarayCurrency = formData.get("salarayCurrency");
  const paymentDate = formData.get("paymentDate");
  const commission = formData.get("commission");
  const commissionPercentage = formData.get("commissionPercentage");
  const monthlyWageSlip = formData.getAll("monthlyWageSlip");
  const workingHours = formData.get("workingHours");
  const gender = formData.get("gender");
  const personalType = formData.get("personalType");
  const serviceType = formData.get("serviceType");
  const commissionDate = formData.get("commissionDate");
  const startingDate = formData.get("startingDate");
  const resignationDate = formData.get("resignationDate");
  const lastDayAtWork = formData.get("lastDayAtWork");
  const cnicFront = formData.get("cnicFront");
  const cnicBack = formData.get("cnicBack");
  const SpecializationCertificate = formData.get("SpecializationCertificate");
  const certificate = formData.get("certificate");
  const cv = formData.get("cv");
  const hiredBy = formData.get("hiredBy");
  const responsibility = formData.get("responsibility");
  const createdByRoles = formData.get("createdByRoles");
  const branchId = formData.get("branchId");

  let responsibilityArray;
  responsibilityArray = JSON.parse(responsibility);
  let workingHoursArray;
  workingHoursArray = JSON.parse(workingHours);

  let newCreatedByRole = "";
  if (createdByRoles === "admin") {
    newCreatedByRole = "Admin";
  }

  const dataToValidate = {
    firstName,
    lastName,
    tCNo,
    email,
    password,
    image,
    country,
    city,
    district,
    town,
    street,
    doorNo,
    salarayAmount,
    salarayCurrency,
    paymentDate,
    commission,
    commissionPercentage,
    // monthlyWageSlip,
    gender,
    personalType,
    serviceType,
    commissionDate,
    startingDate,
    resignationDate,
    lastDayAtWork,
    cnicFront,
    cnicBack,
    SpecializationCertificate,
    certificate,
    cv,
    hiredBy,
    responsibility,
    createdByRoles,
    branchId,
  };

  const { error } = formDataSchema.validate(dataToValidate);
  if (error) {
    return NextResponse.json(
      { error: error.details[0].message },
      { status: 400, headers: corsHeaders }
    );
  }

  if (commission === true) {
    if (commissionPercentage === null) {
      return NextResponse.json(
        { error: "Commission Percentage is Required" },
        { status: 400, headers: corsHeaders }
      );
    }
  }
  if (tCNo.length !== 11 || tCNo.length > 11) {
    return NextResponse.json(
      { error: "TC Number Must Be 11 Digits" },
      { status: 400, headers: corsHeaders }
    );
  }

  const findEmployee = await Employee.findOne({ email });
  if (findEmployee) {
    return NextResponse.json(
      { error: "Employee Already Exist with This Email" },
      { status: 400, headers: corsHeaders }
    );
  }

  // Upload the image to S3
  const bytes = await image.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}-${image.name}`;

  const paramsImage = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: image.type,
    // ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(paramsImage));
  const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

  const imageUrls = [];
  for (const imageFile of monthlyWageSlip) {
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
    imageUrls.push({
      fileUrl: imageUrl,
      uploadedAt: new Date(),
    });
  }
  // let monthlyWageSlipArray = [];
  // if (monthlyWageSlipArrays?.length > 0) {
  //   for (let i = 0; i < monthlyWageSlipArrays.length; i++) {
  //     const slip = monthlyWageSlipArrays[i]; // get each file object (not whole array)

  //     // if (!slip.fileUrl || typeof slip.fileUrl !== "string") continue;

  //     // Optionally fetch the file and convert it to buffer
  //     const res = await fetch(slip);
  //     const bytesSlip = await res.arrayBuffer();
  //     const bufferSlip = Buffer.from(bytesSlip);

  //     const fileNameSlip = `${Date.now()}-${Math.random()
  //       .toString(36)
  //       .substring(2)}.pdf`;

  //     const params = {
  //       Bucket: process.env.AWS_BUCKET_NAME,
  //       Key: fileNameSlip,
  //       Body: bufferSlip,
  //       ContentType: "application/pdf",
  //     };

  //     await s3.send(new PutObjectCommand(params));

  //     const salaryUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileNameSlip}`;

  //     monthlyWageSlipArray.push({
  //       fileUrl: salaryUrl,
  //     });
  //   }
  // }

  // Upload the cv Slip to S3
  const bytesCv = await cv.arrayBuffer();
  const bufferCv = Buffer.from(bytesCv);
  const fileNameCv = `${Date.now()}-${cv.name}`;

  const paramsCv = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileNameCv,
    Body: bufferCv,
    ContentType: cv.type,
    // ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(paramsCv));
  const cvUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileNameCv}`;

  // Upload the CNIC Front to S3
  const bytesCnic = await cnicFront.arrayBuffer();
  const bufferCnic = Buffer.from(bytesCnic);
  const fileNameCnic = `${Date.now()}-${cnicFront.name}`;

  const paramsCnic = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileNameCnic,
    Body: bufferCnic,
    ContentType: cnicFront.type,
    // ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(paramsCnic));
  const cnicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileNameCnic}`;

  // Upload the CNIC Back to S3
  const bytesCnicB = await cnicBack.arrayBuffer();
  const bufferCnicB = Buffer.from(bytesCnicB);
  const fileNameCnicB = `${Date.now()}-${cnicBack.name}`;

  const paramsCnicB = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileNameCnicB,
    Body: bufferCnicB,
    ContentType: cnicBack.type,
    // ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(paramsCnicB));
  const cnicUrlB = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileNameCnicB}`;

  // Upload the Specilization Certificate to S3
  const sCertificate = await SpecializationCertificate.arrayBuffer();
  const bufferSCertificate = Buffer.from(sCertificate);
  const sCertificateFilename = `${Date.now()}-${
    SpecializationCertificate.name
  }`;

  const paramsSCertificate = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: sCertificateFilename,
    Body: bufferSCertificate,
    ContentType: SpecializationCertificate.type,
    // ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(paramsSCertificate));
  const sCertificateUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${sCertificateFilename}`;

  // Upload the Certificate to S3
  const sCertificateNew = await certificate.arrayBuffer();
  const bufferSCertificateNew = Buffer.from(sCertificateNew);
  const sCertificateFilenameNew = `${Date.now()}-${
    SpecializationCertificate.name
  }`;

  const paramsSCertificateNew = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: sCertificateFilenameNew,
    Body: bufferSCertificateNew,
    ContentType: certificate.type,
    // ACL: "public-read",
  };

  await s3.send(new PutObjectCommand(paramsSCertificateNew));
  const sCertificateUrlNew = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${sCertificateFilenameNew}`;

  const addEmployee = await Employee.create({
    firstName,
    lastName,
    tCNo,
    email,
    password,
    image: imageUrl,
    country,
    city,
    district,
    town,
    street,
    doorNo,
    salarayAmount,
    salarayCurrency,
    paymentDate,
    commission,
    commissionPercentage,
    monthlyWageSlip: imageUrls,
    gender,
    personalType,
    serviceType,
    commissionDate,
    startingDate,
    resignationDate,
    lastDayAtWork,
    cnicFront: cnicUrl,
    cnicBack: cnicUrlB,
    SpecializationCertificate: sCertificateUrl,
    certificate: sCertificateUrlNew,
    cv: cvUrl,
    hiredBy,
    responsibility: responsibilityArray,
    workingHours: workingHoursArray,
    createdByRole: newCreatedByRole,
    branchId,
  });

  if (addEmployee) {
    return NextResponse.json({
      message: "Employee For This Branch Added Successfully",
      data: addEmployee,
      status: 201,
    });
  } else {
    return NextResponse.json({
      error: "Employee For This Branch Added Failed. Please Try Again",
      status: 400,
      headers: corsHeaders,
    });
  }
}
 
