import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import mongoose from "mongoose";
import Service from "../../../../../../models/Service";
import Product from "../../../../../../models/Product";
import Offer from "../../../../../../models/Offer";
import Employee from "../../../../../../models/Employee";
import { corsHeaders } from "../../../../../../libs/corsHeader";

export async function GET(req) {
  await connectMongoDB();

  // const token = await getToken(req);
  // if (!token || token.error) {
  //   return NextResponse.json(
  //     { error: token?.error || "Unauthorized Access" },
  //     { status: 401, headers: corsHeaders }
  //   );
  // }
  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");
  const type = searchParams.get("type");
  const types = searchParams.get("types");
  const category = searchParams.get("category");
  //   const page = searchParams.get("page");
  //   const limit = searchParams.get("limit");
  //   const skip = (page - 1) * limit;

  let model;

  if (type === "service") {
    model = Service;
  } else if (type === "product") {
    model = Product;
  } else if (type === "offer") {
    model = Offer;
  } else if (type === "personal") {
    model = Employee;
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Build match object conditionally
  const matchStage = {
    branchId: new mongoose.Types.ObjectId(branchId),
  };

  // Only include category if model is Service
  if (type === "service" && category) {
    matchStage.category = category;
  }
  if (type === "product" && types) {
    matchStage.type = types;
  }
  const result = await model.aggregate([
    {
      $match: matchStage,
    },

    {
      $sort: {
        createdAt: -1,
      },
    },
    // {
    //   $skip: skip,
    // },
    // {
    //   $limit: parseInt(limit),
    // },
  ]);
  return NextResponse.json({
    message: "Data Fetched Successfully",
    data: result,
  });
}

// Handle CORS preflight
export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
