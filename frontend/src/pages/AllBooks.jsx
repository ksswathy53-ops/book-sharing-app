import { useState, useEffect } from "react";
import axios from "axios";
import BookCard from "../Components/BookCard/BookCard";
import Loader from "../Components/Loader/Loader";

const AllBooks = () => {
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("");

  // Fetch books initially
  useEffect(() => {
    fetchFilteredBooks();
  }, []);

  // Re-fetch books when filters change
  useEffect(() => {
    fetchFilteredBooks();
  }, [search, genre, status]);

  const fetchFilteredBooks = async () => {
    setLoading(true);

    try {
      const res = await axios.get(
        "http://localhost:5000/api/books/filter-books",
        {
          params: {
            genre: genre.toLowerCase(),   //  Send lowercase to backend
            author: search,
            status,
          },
        }
      );

      setFiltered(res.data.books || []);
    } catch (err) {
      console.error(err);
      setFiltered([]);
    }

    setLoading(false);
  };

  return (
    <div className="bg-zinc-900 px-12 py-8 h-auto ">
      <div className="mt-8 px-4">
        <h4 className="text-4xl text-yellow-100 text-center">Library</h4>

        {/* FILTER BAR */}
        <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-800 p-4 rounded">

          {/* Search */}
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded bg-zinc-700 text-white w-full md:w-1/3 focus:outline-none"
          />

          {/* Genre Filter */}
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="px-4 py-2 rounded bg-zinc-700 text-white w-full md:w-1/4"
          >
            <option value="">All Genres</option>
            <option value="fiction">Fiction</option>
            <option value="fantasy">Fantasy</option>
            <option value="sci-fi">Sci-Fi</option>
            <option value="romance">Romance</option>
            <option value="mystery">Mystery</option>
            <option value="education">Education</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 rounded bg-zinc-700 text-white w-full md:w-1/4"
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            {/* <option value="Requested">Requested</option> */}
            <option value="Borrowed">Borrowed</option>
          </select>
        </div>

        {/* LOADER */}
        {loading && (
          <div className="flex items-center justify-center my-8">
            <Loader />
          </div>
        )}

        {/* NO RESULTS */}
        {!loading && !filtered.length && (
          <div className="text-white text-center mt-8 col-span-full flex item-center justify-center text-3xl text-yellow-100">No books found</div>
        )}

        {/* BOOK GRID */}
        <div className="my-8 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 min-h-[300px]">
          {filtered.map((book) => (
            <BookCard key={book._id} data={book} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllBooks;
