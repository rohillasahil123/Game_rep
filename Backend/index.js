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
const Quiz = require("./Models/QuizContest")
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
// 🔐authenticateTokenentication Routes
// ===============================

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashPassword
    });

    const wallet = await Wallet.create({ userId: user._id });

    // Remove password before sending response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(201).json({
      message: "User registered",
      user: userWithoutPassword,
      wallet
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password required" });
    }

    const user = await User.findOne({ phone }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    const wallet  = await Wallet.findOne({userId : user._id})

    // Remove password before sending response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword ,
      wallet
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



  
// ===============================
// 💸 Admin Routes
// ===============================

app.get("/quiz/all", authenticateToken , async (req, res) => {
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


app.get("/me",authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    const { userId } = req.params;
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.status(200).json({ balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/add", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ message: "userId and amount are required" });
    }

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      // Create new wallet if not exists
      wallet = new Wallet({ userId, balance: amount });
    } else {
      wallet.balance += amount;
    }

    await wallet.save();

    res.status(200).json({ message: "Amount added", balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
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


// ✅ Get all contests

app.get("/get-contests", async (req, res) => {
  try {
    const contests = await Contest.find().sort({ entryFee: 1 });
    res.status(200).json({ contests });
  } catch (error) {
    console.error("Fetch contests error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



app.post("/create-defaults", async (req, res) => {
  const contests = [
    { entryFee: 5, prize: 10 },
    { entryFee: 10, prize: 20 },
    { entryFee: 25, prize: 50 },
    { entryFee: 50, prize: 100 },
    { entryFee: 100, prize: 200 },
    { entryFee: 200, prize: 400 },
    { entryFee: 500, prize: 1000 },
  ];

  try {
    await Contest.insertMany(contests);
    res.status(201).json({ message: "Contests created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// 🎮 Quiz Routes
// ==============================



// ✅ Join contest (deduct fee, add player)
app.post("/contest/join", async (req, res) => {
  const { userId, contestId } = req.body;
  try {
    const contest = await Contest.findById(contestId);
    const wallet = await Wallet.findOne({ userId });
    const user = await User.findById(userId);

    if (!contest || !wallet || !user) return res.status(404).json({ message: "Invalid data" });
    if (wallet.balance < contest.entryFee) return res.status(400).json({ message: "Insufficient balance" });

    wallet.balance -= contest.entryFee;
    contest.players.push({ userId, fullName: user.fullName });

    await wallet.save();
    await contest.save();

    res.json({ message: "Joined successfully", contest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Get specific contest
app.get("/contest/:id", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate("players.userId");
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const questions = await Quiz.aggregate([
      { $match: { contestId: contest._id } },
      { $sample: { size: 10 } }, // randomly pick 10
      {
        $project: {
          questionText: 1,
          options: 1,
          _id: 1
          // Do not expose correctIndex here
        }
      }
    ]);

    res.json({ contest, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start contest when 2 players joined
app.post("/start/:id", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (contest.players.length === 2) {
      // Logic to start quiz (emit via socket.io or status flag)
      res.json({ message: "Contest started" });
    } else {
      res.status(400).json({ message: "Need 2 players to start" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post("/question", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // 👈 Extracted from JWT token

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const total = await Quiz.countDocuments();
    if (total === 0) {
      return res.status(404).json({ message: "No questions available." });
    }

    const randomIndex = Math.floor(Math.random() * total);
    const question = await Quiz.findOne().skip(randomIndex).select("-__v");

    if (!question) {
      return res.status(500).json({ message: "Failed to fetch question." });
    }

    res.status(200).json({
      message: "Question fetched successfully",
      totalQuestions: total,
      question,
    });
  } catch (err) {
    console.error("Error fetching question:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ✅ Submit answer (update score)
app.post("/submit-answer", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId, contestId, selectedAnswer } = req.body;

    const question = await Quiz.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const isCorrect = question.correctAnswer === selectedAnswer;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const player = contest.players.find(p => p.userId.toString() === userId);
    if (!player) {
      return res.status(400).json({ message: "User not part of this contest" });
    }

    if (isCorrect) {
      player.score += 10;
      await contest.save();
    }

    res.status(200).json({
      message: "Answer submitted",
      correct: isCorrect,
      updatedScore: player.score,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ End contest and set winner
app.post("/end/:id", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const sorted = contest.players.sort((a, b) => b.score - a.score);
    contest.winnerId = sorted[0].userId;
    contest.isCompleted = true;

    await contest.save();
    res.json({ message: "Contest ended", winner: sorted[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Distribute prize
app.post("/distribute/:id", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest.winnerId) return res.status(400).json({ message: "Winner not decided yet" });

    const winnerWallet = await Wallet.findOne({ userId: contest.winnerId });
    winnerWallet.balance += contest.prize;
    await winnerWallet.save();

    res.json({ message: "Prize distributed", prize: contest.prize });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get leaderboard
app.get("/leaderboard/:contestId", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.contestId).populate("players.userId");
    const sorted = contest.players.sort((a, b) => b.score - a.score);
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

app.post("/withdraw",authenticateToken, async (req, res) => {
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

app.get("/history",authenticateToken, async (req, res) => {
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
