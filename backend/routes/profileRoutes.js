
const router = require("express").Router();
const User = require("../db/models/userSchema");
const bcrypt = require("bcryptjs");
const { authenticateToken } = require("../middlewares/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// MULTER 
const uploadFolder = path.join(__dirname, "../uploads");

//  uploads folder exists
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

//  GET MY PROFILE
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});






//  UPDATE BASIC PROFILE
router.put("/update", authenticateToken, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
    }).select("-password");

    res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





//  CHANGE PASSWORD
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(req.user.id);
    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





//  UPDATE USER AVATAR (file upload using multer)
router.put(
  "/update-avatar",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Avatar file required" });
      }

      // Build file URL
      const avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;

      const updated = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: avatarUrl },
        { new: true }
      ).select("-password");

      res.json({ message: "Avatar updated", user: updated });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);








// DELETE ACCOUNT (only if user has not borrowed any books)
router.delete("/delete", authenticateToken, async (req, res) => {
  try {
    const Book = require("../db/models/bookSchema");

    //  Check if user has borrowed any books
    const borrowedBooks = await Book.find({ borrowedBy: req.user.id });

    if (borrowedBooks.length > 0) {
      return res.status(400).json({
        message: "You cannot delete your account while you have borrowed books. Please return them first."
      });
    }

    //  Delete all books uploaded by this user
    await Book.deleteMany({ owner: req.user.id });

    //  Delete the user
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: "Account deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



//  GET USER STATS (books uploaded, borrowed, requests)
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const Book = require("../db/models/bookSchema");
    const BookRequest = require("../db/models/bookRequestSchema");

    const ownedBooks = await Book.countDocuments({ owner: req.user.id });
    const borrowedBooks = await Book.countDocuments({
      borrowedBy: req.user.id,
    });
    const totalRequests = await BookRequest.countDocuments({
      requester: req.user.id,
    });

    res.json({
      stats: {
        ownedBooks,
        borrowedBooks,
        totalRequests,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

