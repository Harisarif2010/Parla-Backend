import { NextResponse } from "next/server";
import connectMongoDB from "../../../../libs/dbConnect";
import { getToken } from "../../../../libs/getToken";
import Feedback from "../../../../models/Feedback";

export async function POST(req) {
  try {
    await connectMongoDB();
    const token = await getToken(req);

    if (!token || token.error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, rating } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const feedback = new Feedback({
      userId: token.id, // taken from token
      message,
      rating,
    });

    await feedback.save();

    return NextResponse.json(
      { message: "Feedback submitted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error submitting feedback:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
