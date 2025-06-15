//✅ Required Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");
const { initializeSocket } = require("./socket");


//✅ Models
const User = require("./Models/User_Model");
const Wallet = require("./Models/Wallet_Model");
const Quiz = require("./Models/QuizContest");
const WithdrawRequest = require("./Models/WithdrawRequest");

//✅ Middleware
const authenticateToken = require("./middleware/Authantication");
require("./config/db");

//✅ Initialize
dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));



// Initialize socket
initializeSocket(server);


//✅ Test Route
app.get("/", (req, res) => res.send("API is running..."));

// ===============================
// 🔐 Authentication Routes
// ===============================

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password || !phone) return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(409).json({ message: "User already exists" });

    const hashPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const user = await User.create({ fullName, email, phone, password: hashPassword });
    const wallet = await Wallet.create({ userId: user._id });

    res.status(201).json({ message: "User registered", user, wallet });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: "Phone and password required" });

    const user = await User.findOne({ phone });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ message: "Login successful", user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// 👤 User Routes
// ===============================

app.get("/getUser/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const wallet = await Wallet.findOne({ userId });
    res.status(200).json({ user, wallet });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/getAllUser", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// 💰 Wallet Routes
// ===============================

app.get("/wallet/:userId", async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });
    res.status(200).json({ wallet });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/wallet/add", authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });
    console.log(amount, "amount")
    const wallet = await Wallet.findOne({ userId: req.user._id });
    console.log(wallet , "wallet")
    wallet.balance += amount;
    wallet.transactions.push({ type: "credit", amount, description: "Manual Add" });
    await wallet.save();
console.log("34")
    res.status(200).json({ message: "Amount added", balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/wallet/update", async (req, res) => {
  try {
    const { userId, amount, description } = req.body;
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    if (amount < 0 && wallet.balance + amount < 0) return res.status(400).json({ message: "Insufficient balance" });

    wallet.balance += amount;
    wallet.transactions.push({ type: amount > 0 ? "credit" : "debit", amount: Math.abs(amount), description });
    await wallet.save();

    res.status(200).json({ message: "Wallet updated", balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// 🎮 Quiz Routes
// ===============================

app.post("/quiz/join", authenticateToken, async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user.id;

    // ✅ Find an open quiz or create a new one
    let quiz = await Quiz.findOne({ open: true });

    if (!quiz) {
      // Fetch all quiz documents
      const allQuizzes = await Quiz.find();
      const allQuestions = allQuizzes.flatMap(q => q.questions);

      if (allQuestions.length < 10) {
        return res.status(400).json({ message: "Not enough questions to create quiz" });
      }

      // Shuffle & pick 10 questions
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 10);

      // Create new quiz
      quiz = await Quiz.create({
        title: "Random Quiz",
        entryFee: 5,
        rewardPerQuestion: 1,
        questions: selected,
        players: []
      });
    }

    // ❌ Quiz closed check (in case it became closed after finding)
    if (!quiz.open) {
      return res.status(400).json({ message: "Quiz is already closed" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < quiz.entryFee) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Check if user already joined
    const alreadyJoined = quiz.players.some(p => p.userId.toString() === userId);
    if (alreadyJoined) {
      return res.status(200).json({ message: "Already joined", quizId: quiz._id });
    }

    // Deduct entry fee
    wallet.balance -= quiz.entryFee;
    wallet.transactions.push({
      type: "debit",
      amount: quiz.entryFee,
      description: `Joined quiz: ${quiz.title}`
    });
    await wallet.save();

    // Add player
    quiz.players.push({ userId, fullName });
    await quiz.save();

    res.status(200).json({
      message: "Quiz joined",
      quizId: quiz._id,
      balance: wallet.balance
    });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.get("/quiz/random",authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ open: true }).lean();
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return res.status(404).json({ message: "No quiz or questions found" });
    }

    const count = Math.min(10, quiz.questions.length); // return up to 10
    const shuffled = quiz.questions.sort(() => 0.5 - Math.random());
    
    const selected = shuffled.slice(0, count).map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer   // include correct answer
    }));

    res.status(200).json({ questions: selected, quizId: quiz._id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


  app.post("/quiz/submit-answer",authenticateToken,  async (req, res) => {
    try {
      const { quizId, questionText, selectedOption } = req.body;
      const userId = req.user.id;

      const quiz = await Quiz.findById(quizId);
      if (!quiz) return res.status(404).json({ message: "Quiz not found" });

      const question = quiz.questions.find(q => q.question === questionText);
      if (!question) return res.status(404).json({ message: "Question not found" });

      const player = quiz.players.find(p => p.userId.toString() === userId);
      if (!player) return res.status(403).json({ message: "User not joined in this quiz" });

      if (selectedOption === question.correctAnswer) {
        player.score += quiz.rewardPerQuestion;
        await quiz.save();
        return res.status(200).json({ correct: true, newScore: player.score });
      } else {
        return res.status(200).json({ correct: false, newScore: player.score });
      }
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  });

// ===============================
// 💸 LeaderBoard Routes
// ===============================

app.get("/quiz/leaderboard/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const sortedPlayers = quiz.players.sort((a, b) => b.score - a.score);
    res.status(200).json({ leaderboard: sortedPlayers });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// ===============================
// 💸 Withdraw Routes
// ===============================

app.post("/withdraw", authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    await WithdrawRequest.create({ userId, amount });
    res.status(200).json({ message: "Withdraw request submitted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/history", authenticateToken, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.id });
    res.status(200).json({ transactions: wallet.transactions });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// 🧼 Error Middleware
// ===============================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// ===============================
// 🚀 Start Server
// ===============================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
