


import { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../Components/Loader/Loader";

const MyRequests = ({ refreshTrigger }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to view your requests");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:5000/api/request/my-requests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // console.log("MyRequests response:", response.data);
      setRequests(response.data.requests || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch requests");
      setRequests([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, [refreshTrigger]);

  const handleCancel = async (requestId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:5000/api/request/cancel/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Request canceled");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel request");
    }
  };

  //  NEW — Request Return
  const handleReturnBook = async (requestId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `http://localhost:5000/api/request/return-book/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Return request sent!");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to request return");
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center text-white text-2xl">
        No requests yet
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 px-8 py-8">
      <h1 className="text-3xl text-yellow-100 mb-6">My Requests</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {requests.map((req) => (
          <div
            key={req._id}
            className="bg-zinc-800 p-4 rounded flex flex-col justify-between items-center min-h-[400px]"
          >
            {/* TOP CONTENT */}
            <div className="flex flex-col items-center">
              <img
                src={req.book?.imageUrl}
                alt={req.book?.title}
                className="h-40 w-auto rounded mb-4"
              />

              <h2 className="text-white text-xl font-semibold text-center px-2 leading-tight">
                {req.book?.title}
              </h2>

              <p className="text-zinc-400 text-center">{req.book?.author}</p>

              <p
                className={`mt-2 font-semibold ${
                  req.status === "Available"
                    ? "text-green-400"
                    : req.status === "Requested"
                    ? "text-yellow-400"
                    : req.status === "Borrowed"
                    ? "text-blue-400"
                    : req.status === "ReturnRequested"
                    ? "text-purple-400"
                    : "text-red-400"
                }`}
              >
                {req.status}
              </p>
            </div>

            {/* BOTTOM BUTTONS (ALWAYS ALIGNED) */}
            <div className="mt-auto pt-4 flex flex-col items-center w-full">
              {req.status === "Requested" && (
                <button
                  onClick={() => handleCancel(req._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
                >
                  Cancel Request
                </button>
              )}

              {req.status === "Borrowed" && (
                <>
                  <p className="text-zinc-300 text-sm text-center">
                    Borrowed until:{" "}
                    {new Date(req.borrowedUntil).toLocaleDateString()}
                  </p>

                  <button
                    onClick={() => handleReturnBook(req._id)}
                    className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                  >
                    Request Return
                  </button>
                </>
              )}

              {req.status === "ReturnRequested" && (
                <p className="text-purple-300 text-sm text-center">
                  Waiting for owner to confirm return
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRequests;
