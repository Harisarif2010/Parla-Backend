import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../libs/dbConnect";
import Notification from "../../../../../models/Notification";
import { corsHeaders } from "../../../../../libs/corsHeader";
import { getToken } from "../../../../../libs/getToken";
import Customer from "../../../../../models/Customer";
import Employee from "../../../../../models/Employee";
import Admin from "../../../../../models/Admin";

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
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // today | pastdays | older

    if (!type) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 500, headers: corsHeaders }
      );
    }

    const filter = {};
    if (type) {
      filter.createdBy = token.id;
    } // ✅ Add time-based filter
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    if (type === "today") {
      filter.createdAt = {
        $gte: startOfToday,
        $lte: endOfToday,
      };
    } else if (type === "pastdays") {
      const past7Days = new Date();
      past7Days.setDate(past7Days.getDate() - 7);
      filter.createdAt = {
        $gte: past7Days,
        $lt: startOfToday,
      };
    } else if (type === "older") {
      const past7Days = new Date();
      past7Days.setDate(past7Days.getDate() - 7);
      filter.createdAt = {
        $lt: past7Days,
      };
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .populate({
        path: "createdBy",
        select: "firstName lastName image",
      });

    return NextResponse.json(
      { message: "Notifications fetched", data: notifications },
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
