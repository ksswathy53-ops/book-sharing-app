import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../Components/Loader/Loader";
import BookCard from "../Components/BookCard/BookCard";

const BorrowOverview = () => {
  const [borrowed, setBorrowed] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      setLoading(false);
      return;
    }

    try {
      const [borrowedRes, historyRes] = await Promise.all([
        axios.get("http://localhost:5000/api/request/borrowed-books", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/request/borrow-history", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBorrowed(borrowedRes.data.books || []);
      setHistory(historyRes.data.history || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load borrow data");
    }

    setLoading(false);
  };

  //  SEND RETURN REQUEST
  const handleReturnRequest = async (requestId) => {
    const token = localStorage.getItem("token");

    if (!requestId) return alert("Return request cannot be sent — ID missing.");

    try {
      await axios.put(
        `http://localhost:5000/api/request/return-book/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Return request sent successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to request return");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 min-h-screen px-12 py-8">
      <h1 className="text-4xl text-yellow-100 text-center mb-8">
        Borrow Overview
      </h1>

      {/* = CURRENTLY BORROWED */}
      <h2 className="text-2xl text-white mb-4">Currently Borrowed</h2>

      {borrowed.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {borrowed.map((book) => (
            <div
              key={book._id}
              className="bg-zinc-800 p-4 rounded flex flex-col items-center"
            >
              <BookCard data={book} />

              {/*  BORROW REQUEST  */}
              {book.borrowRequest ? (
                book.borrowRequest.status === "ReturnRequested" ? (
                  <p className="text-blue-400 mt-3 text-sm font-medium">
                    Return Requested — waiting for owner confirmation
                  </p>
                ) : (
                  <button
                    onClick={() => handleReturnRequest(book.borrowRequest._id)}
                    className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                  >
                    Request Return
                  </button>
                )
              ) : (
                <p className="text-zinc-500 mt-2 text-sm">
                  No active borrow request linked
                </p>
              )}

              {/* EXPECTED RETURN DATE */}
              {book.expectedReturnDate && (
                <p className="text-yellow-300 mt-3 text-sm">
                  Return by: {new Date(book.expectedReturnDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white mb-8">You have not borrowed any books.</p>
      )}

      {/*  BORROW HISTORY*/}
      <h2 className="text-2xl text-white mb-4">Borrow History</h2>

      {history.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {history.map((request) => (
            <div
              key={request._id}
              className="bg-zinc-800 p-4 rounded flex flex-col items-center"
            >
              <BookCard data={request.book} />

              <p className="text-green-400 mt-3 text-sm font-semibold">
                Returned Successfully
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white">No past borrow records.</p>
      )}
    </div>
  );
};

export default BorrowOverview;
