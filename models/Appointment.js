import { unique } from "next/dist/build/utils";

const mongoose = require("mongoose");

// Chat message schema
const appointmentSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  appointmentNo: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  // employeeId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Employee",
  //   required: true,
  // },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  bookingTimeAndDate: {
    type: String,
    required: true,
  },
  status: {
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  payment: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);
export default Appointment;
