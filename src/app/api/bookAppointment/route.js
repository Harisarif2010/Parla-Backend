import { NextResponse } from "next/server";
import connectMongoDB from "../../../../libs/dbConnect";
import { getToken } from "../../../../libs/getToken";
import Appointment from "../../../../models/Appointment";

export async function POST(req) {
  try {
    await connectMongoDB();

    const body = await req.json();
    const token = await getToken(req);
    if (!token || token.error) {
      return NextResponse.json(
        { error: token?.error || "Unauthorized Access" },
        { status: 401 }
      );
    }

    const { category, employeeId, service, bookingTimeAndDate, payment } = body;
    // Generate a random appointment number using Date and Math.random
    const appointmentNo = "Y-" + Math.floor(100000 + Math.random() * 900000); // e.g., "APT-483920"

    const appointment = new Appointment({
      category,
      appointmentNo,
      employeeId,
      service,
      bookingTimeAndDate,
      payment,
    });
    await appointment.save();
    return NextResponse.json({ message: "Appointment booked successfully" });
  } catch (error) {
    console.error("Error in book appointment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
