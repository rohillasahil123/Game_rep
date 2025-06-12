const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const User = require("./Models/User_Model")
const Wallet = require("./Models/Wallet_Model")
const jwt = require("jsonwebtoken");
 require("./config/db");

// Load env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Auth User
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

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ fullName, email, phone, password: hashPassword });

     const wallet = await Wallet.create({ userId: user._id });

    res.status(201).json({ message: "User registered successfully", user , wallet });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password are required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
      token,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Details
app.get('/getUser/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });
    console.log(user, "ty");

    const wallet = await Wallet.findOne({ userId }); 

    res.status(200).json({ message: "success", user, wallet });

  } catch (error) {
    res.status(500).json({ message: "server error", error });
  }
});

// Get All User
app.get('/getAllUser', async (req, res) => {
  try {
    
    const user = await User.find();
    res.status(200).json({ message: "success", user });

  } catch (error) {
    res.status(500).json({ message: "server error", error });
  }
});





// Wallet APi 
// GET /wallet/:userId → current balance
app.get('/wallet/:userId' , async (req,res)=>{
  try {
    const {userId}  = req.params
    const fetchUserWallet = await Wallet.findOne({userId})
    res.status(200).json({messgae : "success" , fetchUserWallet})
  } catch (error) {
    res.status(500).json({message : "server error"})
  }

})


// Update Wallet
app.post('/wallet/update', async (req, res) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || typeof amount !== 'number') {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (amount < 0 && wallet.balance + amount < 0) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update balance
    wallet.balance += amount;

    // Add transaction
    wallet.transactions.push({
      type: amount > 0 ? 'credit' : 'debit',
      amount: Math.abs(amount),
      description: description || (amount > 0 ? 'Amount added' : 'Amount deducted')
    });

    await wallet.save();

    res.status(200).json({
      message: 'Wallet updated successfully',
      balance: wallet.balance,
      transaction: wallet.transactions[wallet.transactions.length - 1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Error middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
