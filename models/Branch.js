const mongoose = require("mongoose");

const workingHoursSchema = new mongoose.Schema(
  {
    day: { type: String, required: true }, // Example: "Monday"
    date: { type: Date, required: true }, // Example: 2025-05-12
  },
  { _id: false }
);
const branchSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    branchName: { type: String, required: true },
    VAT: { type: String, required: true },
    text_amdinistrator: { type: String, required: true },
    category: { type: String, required: true },
    tax_plate: { type: String, required: false },
    registration: { type: String, required: false },
    license: { type: String, required: false },
    certificate: { type: String, required: false },
    payment_method: { type: String, required: true },
    free_cancel_before: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    town: { type: String, required: true },
    street: { type: String, required: true },
    gps_cordinates: { type: String, required: true },
    phone: { type: String, required: true },
    branch_phone: { type: String, required: true },
    branch_email: { type: String, required: true },
    working_hours: [workingHoursSchema],
    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      // required: true,
      index: true,
    },
    createdByBranchAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch", // null for top-level branches created by admin
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

const Branch = mongoose.models.Branch || mongoose.model("Branch", branchSchema);

export default Branch;
