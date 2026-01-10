import { useState, useEffect } from "react";
import axios from "axios";
import BookCard from "../BookCard/BookCard";
import Loader from "../Loader/Loader";

const RecentlyAdded = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch books
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/books/recent-books");
      setData(response.data.recentBooks); // backend returns
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="mt-8 px-4">
      <h4 className="text-3xl text-yellow-100">New Arrivals</h4>
      {loading && (
        <div className="flex items-center justify-center my-8">
          <Loader />
        </div>
      )}
      <div className="my-8 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {data.map((book) => (
          <BookCard key={book._id} data={book} fetchBooks={fetchBooks} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyAdded;
