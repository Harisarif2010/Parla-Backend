import { ref } from "joi";

const mongoose = require("mongoose");

// Define the schema for a post
const likesOnPostSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true, // Post must have an author
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "createdByModel", // 👈 this enables polymorphic reference
    },
    createdByModel: {
      type: String,
      required: true,
      enum: ["Admin", "Branch"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
// Check if the model is already compiled, if not, compile it.
const LikesOnPost =
  mongoose.models.LikesOnPost ||
  mongoose.model("LikesOnPost", likesOnPostSchema);

export default LikesOnPost;
