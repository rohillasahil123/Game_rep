const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  entryFee: { type: Number, default: 5 },
  rewardPerQuestion: { type: Number, default: 1 },
  open: { type: Boolean, default: true },

  questions: [
    {
      question: String,
      correctAnswer: String,
      options: [String]
    }
  ],

  players: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      fullName: String,
      score: { type: Number, default: 0 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);
