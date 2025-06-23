const mongoose = require("mongoose");

// Define the schema for a post
const permissionSchema = new mongoose.Schema(
  {
    presonalDetail: {
      type: String,
      default: null, // Optional field for an image URL
    },
    passwordAndSecurity: {
      type: String,
      default: null, // Optional field for an image URL
    },
    InformationAndPermission: {
      type: String,
      default: null, // Optional field for an image URL
    },
    Payment: {
      type: String,
      default: null, // Optional field for an image URL
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
// Check if the model is already compiled, if not, compile it.
const Permission =
  mongoose.models.Permission || mongoose.model("Permission", permissionSchema);

export default Permission;
