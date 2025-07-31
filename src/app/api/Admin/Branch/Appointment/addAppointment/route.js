import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../../libs/corsHeader";
import Appointment from "../../../../../../../models/Appointment";
import Notification from "../../../../../../../models/Notification";

export async function POST(req) {
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

  const { confirmResult, booking } = await req.json();

  function generateAppointmentNumber() {
    const prefix = "APT";
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // generates a 6-digit number
    const timestamp = Date.now().toString().slice(-4); // adds uniqueness using last 4 digits of timestamp
    return `${prefix}-${randomNumber}-${timestamp}`;
  }
  const appointmentNo = generateAppointmentNumber();
  // Add Appointment
  const addAppointment = await Appointment.create({
    serviceName: booking.serviceName,
    serviceMints: booking.serviceMints,
    serviceCategory: booking.serviceCategory,
    price: booking.price,
    employeeId: booking.employeeId,
    employeeName: booking.employeeName,
    discount: booking.discount,
    discountDetail: booking.discountDetail,
    appointmentNo: appointmentNo,
    branchId: booking.branchId,
    bookingTime: booking.bookingTime,
    bookingDate: booking.bookingDate,
    customerId: new mongoose.Types.ObjectId(token?.id),
    payment: booking.price,
    paymentId: confirmResult?.id,
  });

  // ✅ Add Notification for the customer
  await Notification.create({
    title: "Appointment Booked",
    message: `Your appointment with ${booking.employeeName} for ${booking.serviceName} on ${booking.bookingDate} at ${booking.bookingTime} has been successfully booked.`,
    createdBy: token.id,
    role: token.role.charAt(0).toUpperCase() + token.role.slice(1), // ✅ Capitalized
    data: {
      appointmentId: addAppointment._id,
    },
  });
  if (!addAppointment) {
    return NextResponse.json(
      { error: "Appointment not added" },
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
  return NextResponse.json(
    {
      message: "Appointment Added SSuccessfully",
    },
    {
      status: 200,
      headers: corsHeaders, // ← Make sure to include CORS headers
    }
  );
}

// Handle CORS preflight
export async function OPTIONS(req) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
