//✅ Required Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

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

app.get("/quiz/random", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ open: true });

    if (!quiz || quiz.questions.length === 0) {
      return res.status(404).json({ message: "No quiz or questions found" });
    }

    // 👇 Choose a random number between 5 and total available or max 10
    const max = Math.min(quiz.questions.length, 10);
    const min = 5;
    const count = Math.floor(Math.random() * (max - min + 1)) + min;

    const shuffled = quiz.questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    res.status(200).json({ totalAvailable: quiz.questions.length, count, questions: selected });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});




app.post("/join", authenticateToken, async (req, res) => {
  try {
    const { contestId, fullname } = req.body;
    const userId = req.user.id;
    const contest = await Quiz.findById(contestId);

    if (!contest) return res.status(404).json({ message: "Contest not found" });
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < contest.entryFee) return res.status(400).json({ message: "Insufficient balance" });

    wallet.balance -= contest.entryFee;
    wallet.transactions.push({ type: "debit", amount: contest.entryFee, description: "Join Contest" });
    await wallet.save();

    if (!contest.players.some(p => p.userId.toString() === userId)) {
      contest.players.push({ userId, fullName: fullname });
      await contest.save();
    }

    res.status(200).json({ message: "Joined contest", balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/reward", authenticateToken, async (req, res) => {
  try {
    const { reward } = req.body;
    const wallet = await Wallet.findOne({ userId: req.user.id });

    wallet.balance += reward;
    wallet.transactions.push({ type: "credit", amount: reward, description: "Quiz Reward" });
    await wallet.save();

    res.status(200).json({ message: "Reward added", balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
