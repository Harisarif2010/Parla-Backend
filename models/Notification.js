import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "", // Optional short heading
    },
    message: {
      type: String,
      default: "", // Description of the notification
    },
    role: {
      type: String,
      enum: ["Admin", "Customer", "Employee", "BranchAdmin"],
      required: false, // Optional, in case you want to target by role
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Store additional info like appointmentId
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "role",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
