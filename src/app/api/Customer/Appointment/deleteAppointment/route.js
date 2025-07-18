import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Appointment from "../../../../../../models/Appointment";
import Notification from "../../../../../../models/Notification";

export async function DELETE(req) {
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
  const appointmentId = searchParams.get("appointmentId");

  // search the appointment by id
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return NextResponse.json(
      { error: "Appointment not found" },
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  if (
    appointment.status === "completed" ||
    appointment.status === "confirmed"
  ) {
    return NextResponse.json(
      {
        error: `Appointment already ${appointment?.status}. You can't cancel this appointment.`,
      },
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  // cancel the appointment
  const cancelAppointment = await appointment.updateOne({
    status: "cancelled",
  });

  // ✅ Create Notification for the deleted appointment
  await Notification.create({
    title: "Appointment Deleted",
    message: `Your appointment for ${deleteAppointment.serviceName} on ${deleteAppointment.bookingDate} at ${deleteAppointment.bookingTime} has been deleted.`,
    createdBy: token.id,
    role: token.role.charAt(0).toUpperCase() + token.role.slice(1), // ✅ Capitalized
    data: {
      appointmentId,
    },
  });
  if (deleteAppointment) {
    return NextResponse.json(
      { message: "Appointment deleted Successfully" },
      {
        status: 200,
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
