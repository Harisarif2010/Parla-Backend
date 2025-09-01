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
    branchId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch", // optional, only if you want to populate later
        required: true,
      },
    ],

    type: {
      type: String,
      enum: ["post", "offer"],
      default: "offer",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Active", "Not Active"], // allowed values
      default: "Not Active", // default value if none is provided
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
// Check if the model is already compiled, if not, compile it.
const Offer = mongoose.models.Offer || mongoose.model("Offer", offerSchema);

export default Offer;
