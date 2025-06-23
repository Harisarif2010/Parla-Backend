import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post", // Assuming there's a "Post" model for posts
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  comment: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
      content: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      replies: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
          },
          content: {
            type: String,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ], // This is where replies are stored
    },
  ],
});

export default mongoose.models.Comments ||
  mongoose.model("Comments", CommentSchema);
