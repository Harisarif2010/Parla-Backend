const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, required: true },
    userName: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    category: { type: String, required: true },
    createdByRole: {
      type: String,
      enum: ["admin", "branch"],
      required: true,
    },
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "createdByRole", // 👈 dynamic reference based on createdByRole
    },
  },
  { timestamps: true }
);

// Dynamic referencing requires refPath
// createdById will refer to either "Admin" or "Branch" based on createdByRole

const Employee =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

export default Employee;
