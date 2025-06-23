const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    unique: true,
    required: true,
  },
  balance: { type: Number, required: true, default: 0 },
  currency: { type: String, default: "USD" },
  updatedAt: { type: Date, default: Date.now },
});

const Wallet =
  mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);
export default Wallet;
