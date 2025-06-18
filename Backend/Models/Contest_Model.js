const mongoose = require("mongoose");

const ContestSchema = new mongoose.Schema({
  entryFee: {
    type: Number,
    required: true
  },
  prize: {
    type: Number,
    required: true
  },
  players: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
      fullName: String,
      score: { type: Number, default: 0 }
    }
  ],
  isCompleted: {
    type: Boolean,
    default: false
  },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" }
}, { timestamps: true });

module.exports = mongoose.model("Contest", ContestSchema);
