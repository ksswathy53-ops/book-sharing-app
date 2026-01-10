const router = require("express").Router();
const Book = require("../db/models/bookSchema");
const { authenticateToken } = require("../middlewares/auth");

//  ADD BOOK
router.post("/add-book", authenticateToken, async (req, res) => {
  try {
    const { title, author, description, genre, imageUrl } = req.body;

    if (!title || !author || !description || !genre || !imageUrl) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the same user already added the same book
    const existingBook = await Book.findOne({
      title: title,
      author: author,
      owner: req.user.id,
    });

    if (existingBook) {
      return res
        .status(400)
        .json({ message: "You have already added this book!" });
    }

    const newBook = new Book({
      title,
      author,
      description,
      genre,
      imageUrl,
      owner: req.user.id,
      status: "Available",
    });

    await newBook.save();

    return res
      .status(201)
      .json({ message: "Book added successfully", book: newBook });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});






//  UPDATE BOOK(owner)
router.put("/update-book/:bookId", authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, author, description, genre, imageUrl } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Only owner can update
    if (book.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this book" });
    }

    // Update fields
    if (title) book.title = title;
    if (author) book.author = author;
    if (description) book.description = description;
    if (genre) book.genre = genre;
    if (imageUrl) book.imageUrl = imageUrl;

    await book.save();

    return res.status(200).json({ message: "Book updated successfully", book });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});






//  DELETE BOOK(owner)
router.delete("/delete-book/:bookId", authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Only owner can delete
    if (book.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not the owner of this book" });
    }

    await Book.findByIdAndDelete(bookId);

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});







//  GET RECENTLY ADDED BOOKS(all users even without login)
router.get("/recent-books", async (req, res) => {
  try {
    // Fetch latest 4 books, sorted by creation date descending
    const recentBooks = await Book.find()
      .populate("owner", "username email avatar")
      .sort({ createdAt: -1 }) // newest first-last added book first shows
      .limit(4); // 4 books only

    return res.status(200).json({ recentBooks });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});






//  GET ALL BOOKS(all users even without login)
router.get("/get-all-books", async (req, res) => {
  try {
    const books = await Book.find()
      .populate("owner", "username email avatar")
      .sort({ createdAt: -1 });
    return res.status(200).json({ books });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});





//  GET BOOK BY ID
router.get("/get-book/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await Book.findById(bookId).populate(
      "owner",
      "username email avatar"
    );
    if (!book) return res.status(404).json({ message: "Book not found" });

    return res.status(200).json({ book });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});






//  GET BOOKS OF LOGGED-IN USER-(owner)
router.get("/my-books", authenticateToken, async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ books });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});






// borrowed books owner
router.get("/borrowed-books", authenticateToken, async (req, res) => {
  try {
    const books = await Book.find({ borrowedBy: req.user.id })
      .populate("owner", "username email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({ books });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//


//filtering books by the author,genre, status
router.get("/filter-books", async (req, res) => {
  try {
    const { genre, author, status } = req.query;

    let filter = {};

    // Genre filter
    if (genre) {
      filter.genre = { $regex: new RegExp(genre, "i") };
    }

    // Title or Author Search
    if (author) {
      filter.$or = [
        { title: { $regex: author, $options: "i" } },
        { author: { $regex: author, $options: "i" } }
      ];
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    const books = await Book.find(filter);

    return res.status(200).json({ books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
