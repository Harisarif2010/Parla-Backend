import { ref, required } from "joi";

const mongoose = require("mongoose");

// Define the schema for a post
const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null, // Optional field for an image URL
    },
    category: {
      type: String,
      required: true,
    },
    // employeeId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Employee",
    // },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    discountType: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
      required: true,
    },
    limitType: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    repeat: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    created: {
      type: String,
      default: null,
    },
    createdBy: {
      type: String,
      default: null,
        },
    createdDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
// Check if the model is already compiled, if not, compile it.
const Offer =
  mongoose.models.Offer || mongoose.model("Offer", offerSchema);

export default Offer;
