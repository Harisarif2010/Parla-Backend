const mongoose = require("mongoose");

// Chat message schema
const appointmentSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
  },
  serviceMints: {
    type: String,
    required: true,
  },
  serviceCategory: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  discount: {
    type: String,
    // required: true,
  },
  discountDetail: {
    discountPrice: { type: String },
    discountPercentage: { type: String },
    discountStartDate: { type: String },
    discountEndDate: { type: String },
    onlyBetweenTime: { type: Boolean },
    onlyBetweenEndTime: { type: String },
    onlyBetweenDays: [{ type: String }],
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
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  bookingTime: {
    type: String,
    required: true,
  },
  bookingDate: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },

  payment: {
    type: String,
    required: true,
  },
  paymentId: {
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
