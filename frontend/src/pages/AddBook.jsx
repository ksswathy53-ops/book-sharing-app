import { useState } from "react";
import axios from "axios";

const AddBook = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleAddBook = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first!");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/books/add-book",
        { title, author, description, genre, imageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);
      setTitle("");
      setAuthor("");
      setDescription("");
      setGenre("");
      setImageUrl("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add book");
      console.error(err);
    }
  };

  return (
    <div className="bg-zinc-900 min-h-screen px-8 py-8">
      <h2 className="text-3xl mb-6 text-yellow-100 text-center">Add New Book</h2>

      <form
        onSubmit={handleAddBook}
        className="max-w-lg mx-auto bg-zinc-800 p-6 rounded shadow"
      >
        <input
          type="text"
          placeholder="Book Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-zinc-700 text-white"
        />

        <input
          type="text"
          placeholder="Author Name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-zinc-700 text-white"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-zinc-700 text-white h-28"
        ></textarea>

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-zinc-700 text-white"
        >
          <option value="">Select Genre</option>
          <option value="Fiction">Fiction</option>
          <option value="Fantasy">Fantasy</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Romance">Romance</option>
          <option value="Mystery">Mystery</option>
          <option value="Education">Education</option>
        </select>

        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full mb-6 px-4 py-2 rounded bg-zinc-700 text-white"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 py-2 rounded text-white hover:bg-blue-600"
        >
          Add Book
        </button>
      </form>
    </div>
  );
};

export default AddBook;
