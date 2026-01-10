const router = require("express").Router();
const BookRequest = require("../db/models/bookRequestSchema");
const Book = require("../db/models/bookSchema");
const { authenticateToken } = require("../middlewares/auth");
// const borrowReqController = require("../controllers/borrowRequestController");
const borrowReqController = require("../controllers/borrowRequestController");




// 

// REQUEST A BOOK 
router.post("/request-book/:bookId", authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const requesterId = req.user.id;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Cannot request own book
    if (book.owner.toString() === requesterId) {
      return res
        .status(400)
        .json({ message: "You cannot request your own book" });
    }

    //If book is already borrowed, don't allow request
    if (book.status === "Borrowed") {
      return res
        .status(400)
        .json({ message: "Book is already borrowed by another user" });
    }

    //If someone else already got accepted, block new requests
    const acceptedRequest = await BookRequest.findOne({
      book: bookId,
      status: "Accepted",
    });

    if (acceptedRequest) {
      return res
        .status(400)
        .json({ message: "Owner has already accepted another request" });
    }

    // Prevent duplicate request from same user
    const existingRequest = await BookRequest.findOne({
      book: bookId,
      requester: requesterId,
      status: "Requested",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You have already requested this book" });
    }

    //  Create request
    const newRequest = new BookRequest({
      book: bookId,
      requester: requesterId,
      owner: book.owner,
      status: "Requested",
    });

    await newRequest.save();

    return res.status(201).json({
      message: "Book requested successfully",
      request: newRequest,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


// 

// VIEW INCOMING REQUESTS (OWNER) 
router.get("/incoming-requests", authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Invalid user token" });
    }

    console.log("Logged-in ownerId:", ownerId); // Debug

    const requests = await BookRequest.find({ owner: ownerId })
      .populate("book")
      .populate("requester", "username email avatar")
      .sort({ createdAt: -1 });

    console.log(`Fetched ${requests.length} requests for owner ${ownerId}`); // Debug

    return res.status(200).json({ requests });
  } catch (error) {
    console.error("Error fetching incoming requests:", error);
    return res.status(500).json({ message: error.message });
  }
});


// VIEW MY REQUESTS (REQUESTER) 
router.get("/my-requests", authenticateToken, async (req, res) => {
  try {
    const requesterId = req.user.id;
    const requested = await BookRequest.find({ requester: requesterId })
      .populate("book")
      .populate("owner", "username email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests:requested });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


//


// updating the requests accepted or rejected(owner)
router.put("/update-request/:requestId", authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body || {};

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const cleanStatus = status.trim().toLowerCase();

    if (!["accepted", "rejected"].includes(cleanStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await BookRequest.findById(requestId).populate("requester");
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Only owner can accept/reject
    if (request.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not the owner of this book" });
    }

    const book = await Book.findById(request.book);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Prevent accepting if book is already borrowed
    if (cleanStatus === "accepted" && book.status === "Borrowed") {
      return res.status(400).json({ message: "Book is already borrowed by another user" });
    }

    // Save request status
    const finalStatus = cleanStatus === "accepted" ? "Accepted" : "Rejected";
    request.status = finalStatus;
    await request.save();

    if (finalStatus === "Accepted") {
      // Mark book as borrowed by the requester
      book.status = "Borrowed";
      book.borrowedBy = request.requester._id; 
      await book.save();

      // Reject all other pending requests for the same book
      await BookRequest.updateMany(
        { book: book._id, _id: { $ne: requestId }, status: "Requested" },
        { $set: { status: "Rejected" } }
      );
    }

    // Return updated request and book
    const updatedRequest = await BookRequest.findById(requestId).populate("book").populate("requester");
    return res.status(200).json({
      message: `Request ${finalStatus.toLowerCase()} successfully`,
      request: updatedRequest,
      book
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});



// borrowed books(owner)
router.get("/borrowed-books", authenticateToken, async (req, res) => {
  try {
    const books = await Book.find({ borrowedBy: req.user.id.toString() })
      .populate("owner", "username email avatar")
      .sort({ createdAt: -1 });

    const booksWithRequest = await Promise.all(
      books.map(async (book) => {
        const borrowRequest = await BookRequest.findOne({
          book: book._id,
          requester: req.user.id,
          status: { $in: ["Accepted", "ReturnRequested"] }
        });

        return { ...book.toObject(), borrowRequest };
      })
    );

    return res.status(200).json({ books: booksWithRequest });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});



// SEARCH BOOKS (BY NAME) 
router.get("/search-books", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Search query required" });
    }

    const books = await Book.find({
      title: { $regex: name, $options: "i" },
    });

    return res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});




//  BORROWER REQUESTS RETURN - for returning the borrowed book
router.put("/return-book/:requestId", authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await BookRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Only requester(borrower) can request return
    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({ message: "You cannot return this book" });
    }

    if (request.status !== "Accepted") {
      return res.status(400).json({ message: "Book not currently borrowed" });
    }

    // Update request status to "ReturnRequested"
    request.status = "ReturnRequested";
    request.returnRequestDate = new Date();
    await request.save();

    return res.status(200).json({
      message: "Return request submitted. Waiting for owner confirmation.",
      request,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});



// OWNER CONFIRM RETURN 
router.put("/confirm-return/:requestId", authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await BookRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Only owner can confirm
    if (request.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only owner can confirm return" });
    }

    if (request.status !== "ReturnRequested") {
      return res.status(400).json({ message: "Return not requested yet" });
    }

    // Update request status
    request.status = "Returned";
    request.returnDate = new Date();
    await request.save();

    // Update book status
    const book = await Book.findById(request.book);
    book.status = "Available";
    book.borrowedBy = null;
    book.expectedReturnDate = null;
    await book.save();

    return res.status(200).json({
      message: "Book return confirmed",
      request,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});





// borrow history(requester) already borrowed books 
router.get("/borrow-history", authenticateToken, async (req, res) => {
  try {
    const history = await BookRequest.find({
      requester: req.user.id,
      status: "Returned",
    })
      .populate("book")
      .sort({ returnDate: -1 });

    return res.status(200).json({ history });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// canceling the requested book(requester)
router.delete("/cancel/:requestId", authenticateToken, async (req, res) => {
  try {
    const request = await BookRequest.findById(req.params.requestId);

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    if (request.requester.toString() !== req.user.id)
      return res.status(403).json({ message: "You cannot cancel this request" });

    if (request.status !== "Requested")
      return res.status(400).json({ message: "Only pending requests can be cancelled" });

    await request.deleteOne();

    return res.status(200).json({ message: "Request cancelled successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


// OWNER SET RETURN DEADLINE 
router.put("/set-return-deadline/:requestId", authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { days } = req.body; // number of days for return

    if (!days || typeof days !== "number") {
      return res.status(400).json({ message: "Number of days required" });
    }

    const request = await BookRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Only the owner can set return deadline
    if (request.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not the owner of this book" });
    }

    if (request.status !== "Accepted") {
      return res.status(400).json({ message: "Book is not currently borrowed" });
    }

    const book = await Book.findById(request.book);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Set the expected return date
    const now = new Date();
    const expectedReturn = new Date(now.getTime() + days * 24 * 60 * 60 * 1000); // days to ms
    book.expectedReturnDate = expectedReturn;
    await book.save();

    return res.status(200).json({
      message: `Return deadline set to ${expectedReturn.toDateString()}`,
      book
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});




// SEND EMAIL REMINDER TO BORROWER
router.post(
  "/send-reminder/:requestId",
  authenticateToken,
  borrowReqController.sendReturnReminder
);



module.exports = router;
