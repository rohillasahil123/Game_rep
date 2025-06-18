const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserData",
    required: true
  },
  balance: {
    type: Number,
    default: 50
  },
  transactions: [
    {
      type: {
        type: String, // 'credit' or 'debit'
        enum: ['credit', 'debit']
      },
      amount: Number,
      description: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model("Wallet", WalletSchema);
