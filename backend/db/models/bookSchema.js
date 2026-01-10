const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    description: { type: String },
    genre: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },

    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Available", "Requested", "Borrowed"],
      default: "Available",
    },

    borrowedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      default: null,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
