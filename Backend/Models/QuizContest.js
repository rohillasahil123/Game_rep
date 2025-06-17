// const mongoose = require("mongoose");

// const quizSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   entryFee: { type: Number, default: 5 },
//   rewardPerQuestion: { type: Number, default: 1 },
//   open: { type: Boolean, default: true },

//   roomType: {
//     type: String, // "5", "10", "25", etc.
//     required: true
//   },

//   questions: [
//     {
//       question: String,
//       correctAnswer: String,
//       options: [String]
//     }
//   ],

//   players: [
//     {
//       userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserData" },
//       fullName: String,
//       score: { type: Number, default: 0 },
//       isWinner: { type: Boolean, default: false }  // ✅ New field added
//     }
//   ]
// }, { timestamps: true });

// module.exports = mongoose.model("Quiz", quizSchema);
