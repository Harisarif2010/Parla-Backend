const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    // fullName: { type: String, required: true },
    image: { type: String, default: null },
    token: { type: String, default: null },
  },
  { timestamps: true }
);

// Check if the model is already compiled, if not, compile it.
const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;
