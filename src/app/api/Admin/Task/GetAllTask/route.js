import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import Task from "../../../../../../models/Task";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import { Types } from "mongoose";
import Meet from "../../../../../../models/Meet";

export async function GET(req) {
  await connectMongoDB();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;
    const status = searchParams.get("status");
    const employeeId = searchParams.get("employeeId");

    let query = {};
    let callMeet = false;
    if (status) {
      if (status === "All") {
        query.status = { $in: ["Incomplete", "Complete", "New"] };
      } else if (status === "New") {
        query.status = { $in: ["Incomplete", "Complete", "New"] };
        query.createdAt = {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          $lte: new Date(),
        };
      } else if (status === "Meets") {
        callMeet = true;
      } else {
        query.status = status;
      }
    }
    if (employeeId && Types.ObjectId.isValid(employeeId)) {
      query.taskVisibility = new Types.ObjectId(employeeId);
    }

    if (callMeet === true) {
      const meetsWithCount = await Meet.aggregate([
        { $match: query },

        { $sort: { createdAt: -1 } },

        {
          $facet: {
            meets: [
              { $skip: skip },
              { $limit: limit },
              {
                $lookup: {
                  from: "employees",
                  let: { employeeIds: "$taskVisibility" },
                  pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$employeeIds"] } } },
                    { $project: { _id: 1, firstName: 1, lastName: 1 } },
                  ],
                  as: "taskVisibility",
                },
              },
              // {
              //   $unwind: {
              //     path: "$taskVisibility",
              //     preserveNullAndEmptyArrays: true,
              //   },
              // },
            ],
            totalCount: [{ $count: "count" }],
          },
        },

        {
          $addFields: {
            totalCount: {
              $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
            },
          },
        },
      ]);

      const meets = meetsWithCount[0]?.meets || [];
      const totalCount = meetsWithCount[0]?.totalCount || 0;
      return NextResponse.json(
        { success: true, meets, totalCount, page, limit },
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (callMeet === false) {
      const tasksWithCount = await Task.aggregate([
        { $match: query },

        { $sort: { createdAt: -1 } },

        {
          $facet: {
            tasks: [
              { $skip: skip },
              { $limit: limit },
              {
                $lookup: {
                  from: "employees",
                  let: { employeeIds: "$taskVisibility" },
                  pipeline: [
                    { $match: { $expr: { $in: ["$_id", "$$employeeIds"] } } },
                    { $project: { _id: 1, firstName: 1, lastName: 1 } },
                  ],
                  as: "taskVisibility",
                },
              },
              // {
              //   $unwind: {
              //     path: "$taskVisibility",
              //     preserveNullAndEmptyArrays: true,
              //   },
              // },
            ],
            totalCount: [{ $count: "count" }],
          },
        },

        {
          $addFields: {
            totalCount: {
              $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
            },
          },
        },
      ]);

      const tasks = tasksWithCount[0]?.tasks || [];
      const totalCount = tasksWithCount[0]?.totalCount || 0;
      return NextResponse.json(
        { success: true, tasks, totalCount, page, limit },
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
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
