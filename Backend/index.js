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
const Contest = require("./Models/Contest_Model")

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

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, phone, password: hashPassword });
    const wallet = await Wallet.create({ userId: user._id });

    res.status(201).json({ message: "User registered", user, wallet });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ message: "Login successful", user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



  
// ===============================
// 💸 Admin Routes
// ===============================

app.get("/quiz/all", async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json({ quizzes });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



app.put("/quiz/close/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    quiz.open = false;
    await quiz.save();
    res.status(200).json({ message: "Quiz closed" });
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
    const wallet = await Wallet.findOne({ userId: req.user.id });
    wallet.balance += amount;
    wallet.transactions.push({ type: "credit", amount, description: "Manual Add" });
    await wallet.save();
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
// 👤 Contest Routes
// ===============================


app.post("/create-contests", async (req, res) => {
  try {
    const entryFees = [5, 10, 25, 50, 100, 200, 500];
    const contestsToCreate = entryFees.map(fee => ({
      entryFee: fee,
      winningAmount: fee * 2 // double winning amount
    }));

    await Contest.insertMany(contestsToCreate);
    res.status(201).json({ message: "Contests created successfully." });
  } catch (error) {
    console.error("Contest create error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



app.get("/get-contests", async (req, res) => {
  try {
    const contests = await Contest.find().sort({ entryFee: 1 });
    res.status(200).json({ contests });
  } catch (error) {
    console.error("Fetch contests error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// ===============================
// 🎮 Quiz Routes
// ==============================

app.post("/join/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userId, fullName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quiz ID" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.open) {
      return res.status(404).json({ message: "Quiz not found or not open" });
    }

    const alreadyJoined = quiz.players.some(p => p.userId.toString() === userId);
    if (alreadyJoined) {
      return res.status(400).json({ message: "User already joined this quiz" });
    }

    // Check and deduct entry fee from wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < quiz.entryFee) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // Deduct fee
    wallet.balance -= quiz.entryFee;
    wallet.transactions.push({
      type: "debit",
      amount: quiz.entryFee,
      description: `Joined quiz: ${quiz.title}`
    });
    await wallet.save();

    // Add user to quiz
    quiz.players.push({ userId, fullName });
    await quiz.save();

    res.status(200).json({
      message: "Quiz joined successfully",
      quizId: quiz._id,
      entryFee: quiz.entryFee,
      walletBalance: wallet.balance
    });

  } catch (error) {
    console.error("Join quiz error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post("/submit/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;
    const { userId, questionIndex, selectedOption } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const question = quiz.questions[questionIndex];
    if (!question) return res.status(400).json({ message: "Invalid question index" });

    const isCorrect = question.correctAnswer === selectedOption;

    const player = quiz.players.find(p => p.userId.toString() === userId);
    if (!player) return res.status(404).json({ message: "Player not found in quiz" });

    if (isCorrect) {
      player.score += 1;

      const wallet = await Wallet.findOne({ userId });
      wallet.balance += quiz.rewardPerQuestion;
      wallet.transactions.push({
        type: "credit",
        amount: quiz.rewardPerQuestion,
        description: `Correct answer for quiz ${quiz.title}`
      });
      await wallet.save();
    }

    await quiz.save();

    res.status(200).json({
      message: isCorrect ? "Correct Answer" : "Wrong Answer",
      isCorrect,
      updatedScore: player.score
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate("players.userId", "fullName email");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.status(200).json({ quiz });
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/distribute/:quizId", async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.players.length !== 2) {
      return res.status(400).json({ message: "Invalid quiz room or not enough players" });
    }

    const [p1, p2] = quiz.players;
    let winner, loser;

    if (p1.score > p2.score) {
      winner = p1;
      loser = p2;
    } else if (p2.score > p1.score) {
      winner = p2;
      loser = p1;
    } else {
      // Draw - refund both players
      for (const player of [p1, p2]) {
        const user = await User.findById(player.userId);
        if (user) {
          const wallet = await Wallet.findOne({ userId: user._id });
          if (wallet) {
            wallet.balance += quiz.entryFee;
            wallet.transactions.push({
              type: "credit",
              amount: quiz.entryFee,
              description: "Refund (Draw)"
            });
            await wallet.save();
          }
        }
      }

      quiz.open = false;
      await quiz.save();

      return res.status(200).json({
        message: "Match Draw - Entry Fee Refunded",
        result: "draw"
      });
    }

    const totalPrize = quiz.entryFee * 2;
    const winnerPrize = Math.floor(totalPrize * 0.75);
    const systemCut = totalPrize - winnerPrize;

    const winnerUser = await User.findById(winner.userId);
    const winnerWallet = await Wallet.findOne({ userId: winner.userId });

    if (winnerUser && winnerWallet) {
      winnerWallet.balance += winnerPrize;
      winnerWallet.transactions.push({
        type: "credit",
        amount: winnerPrize,
        description: "Quiz Winnings"
      });
      await winnerWallet.save();
    }

    quiz.open = false;
    await quiz.save();

    res.status(200).json({
      message: "Winnings distributed",
      winner: winner.fullName,
      amount: winnerPrize,
      systemCut
    });
  } catch (error) {
    console.error("Distribute error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ===============================
// 💸 LeaderBoard Routes
// ===============================

app.get("/leaderboard/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate("players.userId", "fullName");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const sortedPlayers = quiz.players
      .map(player => ({
        fullName: player.fullName,
        score: player.score
      }))
      .sort((a, b) => b.score - a.score);

    res.status(200).json({ leaderboard: sortedPlayers });
  } catch (error) {
    console.error("Leaderboard error:", error);
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
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
