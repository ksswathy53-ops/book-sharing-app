import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../Loader/Loader";

const ViewBookDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBook = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/books/get-book/${id}`);
      setData(response.data.book);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  const handleRequest = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to request a book");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/request/request-book/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Book requested successfully!");
      fetchBook(); // refresh book data
    } catch (err) {
      alert(err.response?.data?.message || "Request failed");
    }
    setLoading(false);
  };

  if (!data) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12 bg-zinc-900 flex flex-col md:flex-row gap-8 py-8">
      <div className="bg-zinc-800 rounded p-4 h-[70vh] lg:h-[88vh] w-full lg:w-3/6 flex items-center justify-center">
        <img src={data.imageUrl} alt={data.title} className="h-[50vh] lg:h-[70vh] rounded" />
      </div>

      <div className="p-4 w-full lg:w-3/6">
        <h1 className="text-4xl text-zinc-300 font-semibold">{data.title}</h1>
        <p className="text-zinc-300 mt-1 text-2xl">by {data.author}</p>
        <p className="text-zinc-500 mt-4 text-xl">{data.description}</p>

        {/* Status */}
        <p
          className={`mt-4 text-xl font-semibold ${
            data.status === "Available"
              ? "text-green-400"
              : data.status === "Requested"
              ? "text-yellow-400"
              : "text-red-400"
          }`}
        >
          {data.status}
        </p>

        {/* Request Book Button */}
        {data.status === "Available" && (
          <button
            disabled={loading}
            onClick={handleRequest}
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {loading ? "Requesting..." : "Request Book"}
          </button>
        )}

      </div>
    </div>
  );
};

export default ViewBookDetails;
