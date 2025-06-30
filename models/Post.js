const mongoose = require("mongoose");

// Define the schema for a post
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: [String],
      default: [], // Default to empty array if no images
    },
    description: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Post must have an author
    },
    role: {
      type: String,
      required: true,
    },
    userModel: {
      type: String,
      required: true,
      enum: ["Admin", "Branch"], // Allowed models
    },
    // comments: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Comments", // Reference to the comment model
    //   },
    // ],
    // showToAll: {
    //   type: String,
    //   default: false,
    // },
    // onlyShareWith: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
    // exceptTwo: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
// Check if the model is already compiled, if not, compile it.
const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;
