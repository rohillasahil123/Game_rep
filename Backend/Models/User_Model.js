const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false  // ✅ Hide password by default when fetching user
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet"
  },
  referralCode: String,
  referredBy: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, { timestamps: true });

// ✅ Optional: auto include virtual fields in JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("UserData", UserSchema);
