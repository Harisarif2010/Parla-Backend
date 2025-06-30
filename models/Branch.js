const mongoose = require("mongoose");

const workingHoursSchema = new mongoose.Schema(
  {
    day: { type: String, required: true }, // Example: "Monday"
    from: { type: String, required: true }, // Example: "09:00 AM"
    to: { type: String, required: true }, // Example: "05:00 PM"
  },
  { _id: false }
);

const branchSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    branchName: { type: String, required: true },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    vat: { type: String, required: true },
    textAdministration: { type: String, required: true },
    category: { type: String, required: true },
    taxPlate: { type: String, required: false },
    registration: { type: String, required: false },
    license: { type: String, required: false },
    certificate: { type: String, required: false },
    paymentMethod: { type: String, required: true },
    freeCancelBefore: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    town: { type: String, required: true },
    street: { type: String, required: true },
    streetNo: { type: String, required: true },
    createdDate: { type: Date, required: true },
    authorizedName: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false,
      },
      address: { type: String }, // optional readable address
    },
    phone: { type: String, required: true },
    branchPhone: { type: String, required: true },
    branchEmail: { type: String, required: true },
    workingHours: [workingHoursSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel",
      required: true,
    },
    createdByModel: {
      type: String,
      required: true,
      enum: ["Admin", "Branch"],
    },
  },
  { timestamps: true }
);

const Branch = mongoose.models.Branch || mongoose.model("Branch", branchSchema);

export default Branch;
