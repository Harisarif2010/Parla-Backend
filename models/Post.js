const mongoose = require("mongoose");

// Define the schema for a post
const postSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: null, // Optional field for an image URL
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Post must have an author
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
