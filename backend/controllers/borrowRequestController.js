const BookRequest = require("../db/models/bookRequestSchema");
const Book = require("../db/models/bookSchema");
const User = require("../db/models/userSchema");
const sendEmail = require("../utils/sendEmail");

exports.sendReturnReminder = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await BookRequest.findById(requestId)
      .populate("book")
      .populate("requester");

    if (!request) return res.status(404).json({ message: "Request not found" });

    const borrowerEmail = request.requester.email;
    const bookName = request.book.title;

    await sendEmail(
      borrowerEmail,
      "Book Return Reminder",
      `
        <h3>Return Reminder</h3>
        <p>Please return <b>${bookName}</b> as soon as possible.</p>
      `
    );

    res.json({ message: "Reminder email sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
