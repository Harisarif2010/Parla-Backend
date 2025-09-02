const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // title: {
    //   type: String,
    //   required: true,
    // },
    taskName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignedBy: {
      type: String,
      required: true,
    },
    // titleName: {
    //   type: String,
    //   required: true,
    // },
    dueDate: {
      type: Date,
      required: true,
    },
    taskVisibility: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },
    ],
    assigner: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    media: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["Incomplete", "Complete", "New"],
      default: "Incomplete",
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
export default Task;
