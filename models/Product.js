import { ref, required } from "joi";

const mongoose = require("mongoose");

// Define the schema for a post
const productSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
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
    productName: {
      type: String,
      required: true,
    },
    productBrand: {
      type: String,
      required: true,
    },
    productCode: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    inventory: {
      type: String,
      required: true,
    },
    purchaseQuantity: {
      type: String,
      required: true,
    },
    warningAlert: {
      type: String,
      required: true,
    },
    purchasePricePerPiece: {
      type: String,
      required: true,
    },
    purchaseFrom: {
      type: String,
      // required: true,
    },
    purchaseDate: {
      type: Date,
      // required: true,
    },
    sellPricePerPiece: {
      type: String,
      // required: true,
    },
    invoice: {
      type: String,
      // required: true,
    },
    discount: {
      type: Boolean,
      default: false,
    },
    discountPrice: {
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
    creationBy: { type: String, default: null },
    creationDate: { type: Date, default: Date.now },
    explanation: { type: String, default: null },
    status: { type: String, default: null },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
// Check if the model is already compiled, if not, compile it.
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
