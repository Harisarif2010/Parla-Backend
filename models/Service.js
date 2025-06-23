import { ref, required } from "joi";

const mongoose = require("mongoose");

// Define the schema for a post
const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: null, // Optional field for an image URL
    },
    category: {
      type: String,
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    serviceName: {
      type: String,
      required: true,
    },
    serviceMints: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    discount: {
      type: Boolean,
      defaultult: false,
    },
    discountPrice: {
      type: String,
      default: null,
    },
    discountPercentage: {
      type: String,
      default: null,
    },
    discountStartDate: {
      type: Date,
      default: null,
    },
    discountEndDate: {
      type: Date,
      default: null,
    },
    discountDays: [
      {
        type: String,
        default: null,
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
// Check if the model is already compiled, if not, compile it.
const Service = mongoose.models.Service || mongoose.model("Service", serviceSchema);

export default Service;
