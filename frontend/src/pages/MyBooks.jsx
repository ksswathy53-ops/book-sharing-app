import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../Components/Loader/Loader";
import BookCard from "../Components/BookCard/BookCard";

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null); // book  edited
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    genre: "",
    imageUrl: "",
  });

  const fetchMyBooks = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/books/my-books", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data.books || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load your books");
    }

    setLoading(false);
  };

  const handleDelete = async (bookId) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/books/delete-book/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Book deleted successfully");
      fetchMyBooks();
    } catch (err) {
      console.error(err);
      alert("Failed to delete book");
    }
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      genre: book.genre,
      imageUrl: book.imageUrl,
    });
  };

  const handleUpdateBook = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/books/update-book/${editingBook._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Book updated successfully!");
      setEditingBook(null);
      fetchMyBooks();
    } catch (err) {
      console.error(err);
      alert("Failed to update book");
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!books.length) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center text-white text-2xl">
        You haven't added any books yet.
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 px-12 py-8 min-h-screen">
      <h1 className="text-4xl text-yellow-100 text-center mb-8">My Books</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <div key={book._id} className="bg-zinc-800 p-4 rounded flex flex-col items-center h-[550px] justify-between">
            <BookCard data={book} />
            <p
              className={`mt-2 font-semibold ${
                book.status === "Available"
                  ? "text-green-400"
                  : book.status === "Requested"
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              Status: {book.status}
            </p>

            <div className="mt-4 flex flex-col gap-2 w-full">
              <button
                onClick={() => handleDelete(book._id)}
                className="w-full bg-red-500 text-white py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>

              <button
                onClick={() => handleEditClick(book)}
                className="w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 p-6 rounded w-96">
            <h2 className="text-xl text-yellow-100 mb-4">Edit Book</h2>

            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full mb-2 px-2 py-1 rounded bg-zinc-700 text-white"
            />
            <input
              type="text"
              placeholder="Author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full mb-2 px-2 py-1 rounded bg-zinc-700 text-white"
            />
            <input
              type="text"
              placeholder="Genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full mb-2 px-2 py-1 rounded bg-zinc-700 text-white"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full mb-2 px-2 py-1 rounded bg-zinc-700 text-white"
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full mb-2 px-2 py-1 rounded bg-zinc-700 text-white"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingBook(null)}
                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBook}
                className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooks;
