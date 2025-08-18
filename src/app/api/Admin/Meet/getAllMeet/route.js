import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import Meet from "../../../../../../models/Meet";
import { corsHeaders } from "../../../../../../libs/corsHeader";

export async function GET(req) {
  await connectMongoDB();

  try {
    const { searchParams } = new URL(req.url);

    // 🔹 Pagination params
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;
const meetWithCount = await Meet.aggregate([
  {
    $facet: {
      meets: [
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "employees", // collection name
            localField: "taskVisibility", // field in Meet
            foreignField: "_id", // field in Employee
            as: "taskVisibility",
          },
        },
        {
          $project: {
            partnerName: 1,
            description: 1,
            assignedBy: 1,
            gender: 1,
            age: 1,
            phone: 1,
            datetime: 1,
            nextMeet: 1,
            address: 1,
            location: 1,
            purpose: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            taskVisibility: {
              $map: {
                input: "$taskVisibility",
                as: "emp",
                in: {
                  firstName: "$$emp.firstName",
                  lastName: "$$emp.lastName",
                },
              },
            },
          },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  },
]);


    const meets = meetWithCount[0]?.meets || [];
    const totalCount = meetWithCount[0]?.totalCount[0]?.count || 0;

    return NextResponse.json(
      { success: true, meets, totalCount, page, limit },
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching meets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch meets" },
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
