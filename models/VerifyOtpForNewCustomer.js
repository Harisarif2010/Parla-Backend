import mongoose, { Schema, models, model } from "mongoose";

const VerifyOtpForNewCustomer = new Schema(
  {
    code: {
      type: Number,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default models?.VerifyOtpForNewCustomer ||
  model("VerifyOtpForNewCustomer", VerifyOtpForNewCustomer, "VerifyOtpForNewCustomer");
