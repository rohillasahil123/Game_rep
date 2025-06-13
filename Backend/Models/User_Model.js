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
    required: true
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet"
  },
  referralCode: String,        
  referredBy: String           
}, { timestamps: true });

module.exports = mongoose.model("UserData", UserSchema);
