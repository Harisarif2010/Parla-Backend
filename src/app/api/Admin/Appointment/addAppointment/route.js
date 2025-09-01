import { NextResponse } from "next/server";
import connectMongoDB from "../../../../../../libs/dbConnect";
import { getToken } from "../../../../../../libs/getToken";
import { corsHeaders } from "../../../../../../libs/corsHeader";
import Appointment from "../../../../../../models/Appointment";
import mongoose from "mongoose";
import Employee from "../../../../../../models/Employee";
import TaskNotification from "../../../../../../models/TaskNotification";

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

  //   const { confirmResult, booking } = await req.json();
  const body = await req.json();

  function generateAppointmentNumber() {
    const prefix = "APT";
    const randomNumber = Math.floor(100000 + Math.random() * 900000); // generates a 6-digit number
    const timestamp = Date.now().toString().slice(-4); // adds uniqueness using last 4 digits of timestamp
    return `${prefix}-${randomNumber}-${timestamp}`;
  }

  const getEmployee = await Employee.findById(body?.employeeId).select(
    "firstName lastName"
    );
  const appointmentNo = generateAppointmentNumber();
  // Add Appointment
  const addAppointment = await Appointment.create({
    serviceName: body?.service?.serviceName,
    serviceMints: body?.service?.serviceMints,
    serviceCategory: body?.service?.category,
    price: body?.service?.price,
    employeeId: new mongoose.Types.ObjectId(body.employeeId),
    employeeName: getEmployee?.firstName,
    discount: body?.service?.discount,
    discountDetail: body?.service?.discountDetail,
    appointmentNo: appointmentNo,
    branchId: body?.service?.branchId,
    bookingTime: body?.slot,
    bookingDate: body?.dates,
    customerId: new mongoose.Types.ObjectId(body?.customerId),
    payment: null,
    paymentId: null,
  });

  // ✅ Create Notification for Employee
  const notification = {
    title: "New Appointment Assigned",
    message: `You have a new appointment scheduled with appointment no. ${appointmentNo}`,
    role: "Admin", // creator role
    createdBy: {
      role: "Admin",
      user: new mongoose.Types.ObjectId(token?.id), // customer who booked
    },
    recipients: [
      {
        user: new mongoose.Types.ObjectId(body?.employeeId),
        role: "Employee",
        isRead: false,
      },
    ],
  };

  await TaskNotification.create(notification);
  //   await Notification.create({
  //     title: "Appointment Booked",
  //     message: `Your appointment with ${booking.employeeName} for ${booking.serviceName} on ${booking.bookingDate} at ${booking.bookingTime} has been successfully booked.`,
  //     createdBy: token.id,
  //     role: token.role.charAt(0).toUpperCase() + token.role.slice(1), // ✅ Capitalized
  //     data: {
  //       appointmentId: addAppointment._id,
  //     },
  //   });
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
      status: 200,
    },
    {
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
