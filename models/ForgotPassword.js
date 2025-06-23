import mongoose, { Schema, models, model } from "mongoose";

const ForgotPasswords = new Schema(
  {
    code: {
      type: Number,
      unique: true,
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
    role: {
      type: String,
      enum: ["admin", "branch", "sub-branch", "employee"],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default models?.ForgotPasswords ||
  model("ForgotPasswords", ForgotPasswords, "ForgotPasswords");
