const mongoose = require("mongoose");

const borrowRequestSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    requester: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Requested",
        "Accepted",
        "Rejected",
        "Borrowed",         
        "ReturnRequested", 
        "Returned"
      ],
      default: "Requested",
    },

    requestDate: {
      type: Date,
      default: Date.now,
    },

    returnDate: {
      type: Date,
      default: null,
    },


     //   for reminding borrower
    expectedReturnDate: {
      type: Date,
      default: null,
    },

    
  },
  { timestamps: true }
);

module.exports = mongoose.model("BorrowRequest", borrowRequestSchema);
