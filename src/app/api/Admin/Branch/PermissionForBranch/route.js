import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import Permission from "../../../../../../models/Permission";
import Product from "../../../../../../models/Product";

export async function POST(req) {
  await connectMongoDB();

  const token = await getToken(req);
  if (!token || token.error) {
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      { status: 401 }
    );
  }
  const body = await req.json(); // Get the request body { getPermission : "true" , branchId: ""}

  if (body?.getPermission === "true") {
    const permission = await Permission.find({
      branchId: body?.branchId,
    });
    return NextResponse.json({
      message: "Permission Fetched Successfully",
      data: permission,
    });
  }

  // To Check whether the branch is creating by admin or branch admin
  const addPermission = await Product.create(body);
  await addPermission.save();
  if (addPermission) {
    return NextResponse.json({
      message: "Permission Added For Branch Successfully",
      data: addPermission,
    });
  } else {
    return NextResponse.json({
      error: "Permission Added Failed. Please Try Again",
    });
  }
}
