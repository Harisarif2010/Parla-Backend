import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Permission from "../../../../../../models/Permission";

export async function POST(req) {
  await connectMongoDB();

  const token = await getToken(req);
  if (!token || token.error) {
    return NextResponse.json(
      { error: token?.error || "Unauthorized Access" },
      { status: 401, status: corsHeaders }
    );
  }
  const body = await req.json();

  if (!body?.employeeId)
  {
    return NextResponse.json(
      { error: "Employee Id is required" },
      { status: 400, status: corsHeaders }
    );
  }
  if (body?.getPermission === true) {
    const permission = await Permission.find({
      employeeId: body?.employeeId,
    });
    return NextResponse.json({
      message: "Permission Fetched Successfully",
      data: permission,
    });
  }

  // To Check whether the branch is creating by admin or branch admin
  const addPermission = await Permission.create(body);
  await addPermission.save();
  if (addPermission) {
    return NextResponse.json({
      message: "Permission Added For Employee Successfully",
      data: addPermission,
    });
  } else {
    return NextResponse.json({
      error: "Permission Added Failed For Employee. Please Try Again",
    });
  }
}
