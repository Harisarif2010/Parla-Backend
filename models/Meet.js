const mongoose = require("mongoose");

const meetSchema = new mongoose.Schema(
  {
    partnerName: {
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
    taskVisibility: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },
    ],
    gender: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    datetime: {
      type: Date,
      required: true,
    },
    nextMeet: {
      type: Date,
      required: true,
    },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    purpose: {
      type: String,
      required: true,
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

// 2dsphere index for geo queries
meetSchema.index({ location: "2dsphere" });

const Meet = mongoose.models.Meet || mongoose.model("Meet", meetSchema);
export default Meet;
