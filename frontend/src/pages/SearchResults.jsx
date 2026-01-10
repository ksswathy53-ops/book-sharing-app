import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Loader from "../Components/Loader/Loader";
import BookCard from "../Components/BookCard/BookCard";

const SearchResults = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // taking query after ?name=xyz in backend
  const { search } = useLocation();
  const query = new URLSearchParams(search).get("name");

  const fetchSearchResults = async () => {
    if (!query) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/request/search-books?name=${query}`
      );

      setBooks(res.data.books || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch search results");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 px-8 py-8 min-h-screen text-white">
      <h1 className="text-3xl text-yellow-100 mb-6">
        Search Results for: <span className="text-blue-400">{query}</span>
      </h1>

      {books.length === 0 ? (
        <p className="text-xl text-zinc-400">No books found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book._id} data={book} fetchBooks={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
