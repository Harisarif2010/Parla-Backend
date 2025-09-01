const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    authorized: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    location: {
      lat: Number,
      lng: Number,
    },
    contract: {
      type: String,
      required: true,
    },
    contractDate: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: String,
      required: false,
    },
    deposit: {
      type: String,
      required: false,
    },
    price: {
      type: String,
      required: false,
    },
    rentedFrom: {
      type: String,
      required: false,
    },
    contactPerson: {
      type: String,
      required: false,
    },
    contactPersonPhone: {
      type: String,
      required: false,
    },
    employees: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "inactive",
    },

    officePhoto: [{ type: String, required: false }],
  },
  {
    timestamps: true,
  }
);

const Office = mongoose.models.Office || mongoose.model("Office", officeSchema);
export default Office;
