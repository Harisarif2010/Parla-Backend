const mongoose = require("mongoose");

const cancelAppointmentSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
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
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "cancelled",
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

  cancellationReason: {
    type: String,
    required: true,
  },
  refundStatus: {
    type: String,
    enum: ["not_refunded", "refunded", "partial_refund", "in_process"],
    default: "not_refunded",
  },
  refundAmount: {
    type: String,
    default: "0",
  },
  cancellationDate: {
    type: Date,
    default: Date.now,
  },
});

const CancelAppointment =
  mongoose.models.CancelAppointment ||
  mongoose.model("CancelAppointment", cancelAppointmentSchema);

export default CancelAppointment;
