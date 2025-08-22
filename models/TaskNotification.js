// import mongoose from "mongoose";

// const taskNotificationSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       default: "",
//     },
//     message: {
//       type: String,
//       default: "",
//     },
//     role: {
//       type: String,
//       enum: ["Admin", "Customer", "Employee", "BranchAdmin"],
//       required: false,
//     },
//     data: {
//       type: mongoose.Schema.Types.Mixed,
//       default: null,
//     },
//     isRead: {
//       type: Boolean,
//       default: false,
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       refPath: "role", // person who created it
//       required: true,
//     },
//     recipient: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export default mongoose.models.TaskNotification ||
//   mongoose.model("TaskNotification", taskNotificationSchema);

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

    // 👤 Who created this notification
    createdBy: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "createdBy.role",
      },
      role: {
        type: String,
        enum: ["Admin", "BranchAdmin", "Customer", "Employee"],
        required: true,
      },
    },

    // 👥 Who should receive this notification
    recipients: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "recipients.role",
        },
        role: {
          type: String,
          enum: ["Admin", "BranchAdmin", "Customer", "Employee"],
          required: true,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TaskNotification ||
  mongoose.model("TaskNotification", taskNotificationSchema);
