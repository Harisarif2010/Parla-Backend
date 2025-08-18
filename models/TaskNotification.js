import mongoose from "mongoose";

const taskNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["Admin", "Customer", "Employee", "BranchAdmin"],
      required: false,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "role", // person who created it
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // or "User" if you have a common user model
      required: true, // 👈 now each notification belongs to a specific user
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TaskNotification ||
  mongoose.model("TaskNotification", taskNotificationSchema);
