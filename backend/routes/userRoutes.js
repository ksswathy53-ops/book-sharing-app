const router = require("express").Router();
const User = require("../db/models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middlewares/auth");

// SIGN UP
router.post("/sign-up", async (req, res) => {
  try {
    console.log("Signup Data:", req.body);

    const { username, email, password, address, avatar } = req.body;

    if (!username || !email || !password || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (username.length < 4) {
      return res.status(400).json({
        message: "Username must be at least 4 characters",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    //check already user exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "Username already exists! Try another one" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    // new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      address,
      avatar: avatar || null,
    });

    await user.save();

    console.log("User Created:", user.username);

    return res.status(201).json({
      message: "Signup successful",
    });
  } catch (err) {
    console.error("Signup Error:", err.message);
    return res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// GET USER INFO-not used currently
router.get("/get-user", authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});



// get all users-admin side(not created)
router.get("/all-users", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  const users = await User.find().select("-password");
  res.json({ users });
});

module.exports = router;
