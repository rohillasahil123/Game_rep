const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserData",
    required: true,
    index: true
  },
  balance: {
    type: Number,
    default: 50
  },
  transactions: [
    {
      type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      description: {
        type: String
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Wallet", WalletSchema);
