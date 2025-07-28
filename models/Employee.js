const mongoose = require("mongoose");

const workingHoursSchema = new mongoose.Schema(
  {
    day: { type: String, required: true }, // Example: "Monday"
    from: { type: String, required: true }, // Example: "09:00 AM"
    to: { type: String, required: true }, // Example: "05:00 PM"
  },
  { _id: false }
);
const employeeSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
    password: { type: String, required: true },
    tCNo: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    town: { type: String, required: true },
    street: { type: String, required: true },
    doorNo: { type: String, required: true },
    salarayAmount: { type: Number, required: true },
    salarayCurrency: { type: String, required: true },
    paymentDate: { type: Date, required: true },
    commission: { type: Boolean, required: false },
    commissionPercentage: { type: Number, required: false },
    monthlyWageSlip: {
      type: [
        {
          fileUrl: { type: String, required: true },
          uploadedAt: {
            type: Date,
            default: Date.now, // Automatically set when document is created
          },
        },
      ],
      required: false,
    },
    gender: {
      type: String,
      // enum: ["male", "female"],
      required: true,
    },
    personalType: {
      type: String,
      // enum: ["full-time", "part-time"],
      required: true,
    },
    serviceType: {
      type: String,
      // enum: ["full-time", "part-time"],
      required: true,
    },
    commissionDate: {
      type: Date,
      // required: true,
    },
    startingDate: {
      type: Date,
      // required: true,
    },
    lastDayAtWork: {
      type: String,
      // required: true,
    },
    resignationDate: {
      type: String,
      // required: true,
    },
    cnicFront: {
      type: String,
      required: true,
    },
    cnicBack: {
      type: String,
      required: true,
    },
    SpecializationCertificate: {
      type: String,
      required: true,
    },
    certificate: {
      type: String,
      required: true,
    },
    cv: {
      type: String,
      required: true,
    },
    hiredBy: {
      type: String,
      required: true,
    },
    responsibility: {
      type: [String],
      required: true,
    },
    workingHours: [workingHoursSchema],
    createdByRole: {
      type: String,
      enum: ["Branch", "Admin"],
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "createdByRole", // 👈 dynamic reference based on createdByRole
    },
  },
  { timestamps: true }
);

// Dynamic referencing requires refPath
// createdById will refer to either "Admin" or "Branch" based on createdByRole

const Employee =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

export default Employee;
