const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  entryFee: {
    type: Number,
    required: true,
    enum: [5, 10, 25, 50, 100, 200, 500],
  },
  winningAmount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Contest", contestSchema);
