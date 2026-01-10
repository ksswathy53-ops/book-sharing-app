

import { Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const BookCard = ({ data, fetchBooks, refreshRequests }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(data.status);

  const handleRequest = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to request a book");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/request/request-book/${data._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Book requested successfully!");
      setStatus("Requested");
      if (fetchBooks) fetchBooks();
      if (refreshRequests) refreshRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Request failed");
    }

    setLoading(false);
  };

  return (
    <div className="hover:bg-zinc-800 rounded p-4 flex flex-col w-full max-w-xs
 ">

      
      <Link to={`/view-book-details/${data._id}`}>
        <div className="rounded flex items-center justify-center h-40 overflow-hidden">
          <img
            src={data.imageUrl}
            alt={data.title}
            className="max-h-full object-contain"
          />
        </div>
      </Link>

      <h2 className="mt-4 text-xl text-white font-semibold text-center leading-tight ">
        {data.title}
      </h2>

      <p className="mt-1 text-zinc-400 font-semibold text-center leading-tight">
        {data.author}
      </p>

      <p
        className={`mt-2 text-center font-semibold ${
          status === "Available"
            ? "text-green-400"
            : status === "Requested"
            ? "text-yellow-400"
            : "text-red-400"
        }`}
      >
        {status}
      </p>
        {/* REQUEST BUTTON */}
       <div className="mt-auto w-full">
        {status === "Available" && (
          <button
            disabled={loading}
            onClick={handleRequest}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-white transition"
          >
            {loading ? "Requesting..." : "Request Book"}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;
