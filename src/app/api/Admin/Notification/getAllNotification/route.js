import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import TaskNotification from "../../../../../../models/TaskNotification";
import Admin from "../../../../../../models/Admin";
import Employee from "../../../../../../models/Employee";
import Branch from "../../../../../../models/Branch";
import Customer from "../../../../../../models/Customer";

export async function GET(req) {
  try {
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

    // ⏰ 24 hours ago from *now*
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // ✅ Recent (last 24h)
    const recentNotifications = await TaskNotification.find({
      createdAt: { $gte: oneDayAgo },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "createdBy.user", // createdBy is now { user, role }
        select: "firstName lastName image",
      })
      .populate({
        path: "recipients.user", // recipients is an array of { user, role }
        select: "firstName lastName image",
      });

    // ✅ Older (everything before 24h)
    const olderNotifications = await TaskNotification.find({
      createdAt: { $lt: oneDayAgo },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "createdBy.user",
        select: "firstName lastName image",
      })
      .populate({
        path: "recipients.user",
        select: "firstName lastName image",
      });

    return NextResponse.json(
      {
        message: "Notifications fetched",
        recent: recentNotifications,
        older: olderNotifications,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ⬅️ Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
