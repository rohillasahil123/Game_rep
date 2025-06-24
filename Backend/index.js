const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");
const { initializeSocket } = require("./socket.js");


const OWNER_USER_ID = "6852fdb44055b9fdd86ffdd4"; 


//✅ Models
const User = require("./Models/User_Model");
const Wallet = require("./Models/Wallet_Model");
const Quiz = require("./Models/QuizContest")
const WithdrawRequest = require("./Models/WithdrawRequest");
const Contest = require("./Models/Contest_Model")
const FlappyContest = require("./Models/FlapyBird_model.js")



//✅ Middleware
const authenticateToken = require("./middleware/Authantication");
require("./config/db");
const JWT_SECRET = "JaiBabaKi";

//✅ Initialize
dotenv.config();
const app = express();

const server = http.createServer(app);

app.use(cors({
  origin: ['https://foodenergy.shop', 'https://www.foodenergy.shop' , 'http://localhost:5173/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());
app.use(morgan("dev"));

// Initialize socket
initializeSocket(server); 

//✅ Test Route
app.get("/v1/", (req, res) => res.send("API is running..."));

// ===============================
// 🔐authenticateTokenentication Routes
// ===============================

// Signup
app.post("/v1/signup", async (req, res) => {
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
app.post("/v1/login", async (req, res) => {
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
    console.log(JWT_SECRET , "secret")

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    const wallet = await Wallet.findOne({ userId: user._id });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
      wallet,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


  
// ===============================
// 💸 Admin Routes
// ===============================

app.get("/v1/quiz/all", authenticateToken , async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json({ quizzes });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



app.put("/v1/quiz/close/:quizId", async (req, res) => {
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

app.get("/v1/getUser/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const wallet = await Wallet.findOne({ userId });
    res.status(200).json({ user, wallet });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/v1/me",authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


app.get("/v1/getAllUser", async (req, res) => {
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

app.get("/v1/wallet/:userId",authenticateToken  ,async (req, res) => {
  try {
      const userId = req.user.id;
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.status(200).json({ balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.post("/v1/wallet/add", async (req, res) => {
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


app.post("/v1/wallet/update", async (req, res) => {
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


app.post("/v1/create-contests", async (req, res) => {
  try {
    const entryFees = [5, 10, 25, 50, 100, 200, 500];
    const contestsToCreate = entryFees.map(fee => ({
      entryFee: fee,
      winningAmount: fee * 2 
    }));

    await Contest.insertMany(contestsToCreate);
    res.status(201).json({ message: "Contests created successfully." });
  } catch (error) {
    console.error("Contest create error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




app.post("/v1/create-defaults", async (req, res) => {
const contests = [
  { entryFee: 5, prize: 8.1 },
  { entryFee: 10, prize: 16.2 },
  { entryFee: 25, prize: 40.5 },
  { entryFee: 50, prize: 81 },
  { entryFee: 100, prize: 162 },
  { entryFee: 200, prize: 324 },
  { entryFee: 500, prize: 810 },
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
app.post("/v1/join", authenticateToken, async (req, res) => {
  const { contestId } = req.body;
  const userId = req.user.id;

  try {
    const contest = await Contest.findById(contestId);
    const wallet = await Wallet.findOne({ userId });
    const user = await User.findById(userId);

    if (!contest || !wallet || !user) {
      return res.status(404).json({ message: "Invalid data" });
    }

    if (wallet.balance < contest.entryFee) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Already full?
    if (contest.players.length >= 2) {
      return res.status(400).json({ message: "Contest already full" });
    }

    // Deduct balance and join
    wallet.balance -= contest.entryFee;
    contest.players.push({ userId, fullName: user.fullName });

    await wallet.save();
    await contest.save();

    // ✅ Auto-create if contest is now full
    if (contest.players.length === 2) {
      const newContest = new Contest({
        entryFee: contest.entryFee,
        prize: contest.prize,
        players: [],
        isCompleted: false,
      });
      await newContest.save();
    }

    res.json({ message: "Joined successfully", contest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/v1/get-contests", async (req, res) => {
  try {
    const contests = await Contest.find({
      isCompleted: false,
      $expr: { $lt: [{ $size: "$players" }, 2] }
    });
    res.json({ contests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Get specific contest
app.get("/v1/contest/:id", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate("players.userId");
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const questions = await Quiz.aggregate([
      { $match: { contestId: contest._id } },
      { $sample: { size: 10 } }, 
      {
        $project: {
          questionText: 1,
          options: 1,
          _id: 1
      
        }
      }
    ]);

    res.json({ contest, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post("/v1/question", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; 

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
app.post("/v1/submit-answer", authenticateToken, async (req, res) => {
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
      player.score += 1;
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

app.post("/v1/contest/complete/:id", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    // Sort players by score
    const sorted = contest.players.sort((a, b) => b.score - a.score);
    if (sorted.length === 0) return res.status(400).json({ message: "No players in contest" });

    // Set the winner
    const winner = sorted[0];
    contest.winnerId = winner.userId;
    contest.isCompleted = true;
    await contest.save();

    // Get wallets
    const winnerWallet = await Wallet.findOne({ userId: winner.userId });
    const ownerWallet = await Wallet.findOne({ userId: OWNER_USER_ID });

    if (!winnerWallet || !ownerWallet) {
      return res.status(404).json({ message: "Wallets not found" });
    }

    // Prize Distribution
    const winnerPrize = Math.floor(contest.prize * 0.81);
    const ownerShare = contest.prize - winnerPrize;

    winnerWallet.balance += winnerPrize;
    ownerWallet.balance += ownerShare;

    await winnerWallet.save();
    await ownerWallet.save();

    res.json({
      message: "Contest ended and prize distributed",
      winner: {
        userId: winner.userId,
        fullName: winner.fullName,
        score: winner.score,
        updatedWalletBalance: winnerWallet.balance
      },
      loser: sorted[1]
        ? {
            userId: sorted[1].userId,
            fullName: sorted[1].fullName,
            score: sorted[1].score
          }
        : null,
      prizeDetails: {
        totalPrize: contest.prize,
        winnerShare: winnerPrize,
        ownerShare: ownerShare,
        owner: {
          userId: OWNER_USER_ID,
          updatedWalletBalance: ownerWallet.balance
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});








// ===============================
// 💸 LeaderBoard Routes
// ===============================

// ✅ Get leaderboard
app.get("/v1/leaderboard/:contestId", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.contestId).populate("players.userId");
    const sorted = contest.players.sort((a, b) => b.score - a.score);
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





// ===============================
// 💸 Withdraw Routes
// ===============================

app.post("/v1/withdraw",authenticateToken, async (req, res) => {
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
// 🧼 Flappy Birds
// ===============================


//  Contest flapy birds

app.post("/v1/create/bird", async (req, res) => {
const contests = [
  { entryFee: 5, prize: 8.1 },
  { entryFee: 10, prize: 16.2 },
  { entryFee: 25, prize: 40.5 },
  { entryFee: 50, prize: 81 },
  { entryFee: 100, prize: 162 },
  { entryFee: 200, prize: 324 },
  { entryFee: 500, prize: 810 },
];


  try {
    await FlappyContest.insertMany(contests);
    res.status(201).json({ message: "Contests created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ✅ Get All Flappy Contests
app.get("/v1/flappy/contests", async (req, res) => {
  try {
    const contests = await FlappyContest.find({}, { roomId: 1, entryFee: 1, prize: 1 }).sort({ entryFee: 1 });
    res.json({ success: true, contests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// routes/flappyRoutes.js
app.post("/flappy/join", async (req, res) => {
  const { userId, roomId, fullname } = req.body;
  const entryFee = parseInt(roomId);

  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.balance < entryFee) {
    return res.status(400).json({ success: false, message: "Insufficient balance" });
  }

  wallet.balance -= entryFee;
  wallet.transactions.push({
    type: "debit",
    amount: entryFee,
    description: `Joined Flappy ₹${entryFee} game`,
  });
  await wallet.save();

  await FlappyContest.findOneAndUpdate(
    { roomId },
    { $push: { players: { userId, fullname } } },
    { upsert: true, new: true }
  );

  res.json({ success: true, message: "Joined Flappy Game" });
});





// GET /api/flappy/leaderboard

app.get("/flappy/leaderboard", async (req, res) => {
  const top = await FlappyContest.aggregate([
    { $unwind: "$players" },
    { $match: { "players.isWinner": true } },
    {
      $group: {
        _id: "$players.fullname",
        totalWins: { $sum: 1 },
        totalScore: { $sum: "$players.score" },
      },
    },
    { $sort: { totalWins: -1, totalScore: -1 } },
    { $limit: 10 },
  ]);

  res.json(top);
});














//  ==============================
//      Admin Api 
//  ==============================

app.get("/flappy/all", async (req, res) => {
  const contests = await FlappyContest.find().sort({ createdAt: -1 });
  res.json(contests);
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
