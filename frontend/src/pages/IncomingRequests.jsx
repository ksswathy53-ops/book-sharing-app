
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Components/Loader/Loader";

const IncomingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const token = localStorage.getItem("token");
  const loggedInUserId = JSON.parse(localStorage.getItem("user"))?._id;

  const fetchIncomingRequests = async () => {
    setLoading(true);
    if (!token) return setLoading(false);

    try {
      const res = await axios.get(
        "http://localhost:5000/api/request/incoming-requests",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests(res.data.requests || []);
    } catch (err) {
      console.error("Incoming Requests Error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchIncomingRequests();
  }, []);

  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    }`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  // OWNER: Accept / Reject
  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/request/update-request/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast(`Request ${status}`);
      fetchIncomingRequests();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update request", "error");
    }
  };

  // OWNER: Confirm Return
  const handleConfirmReturn = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/request/confirm-return/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("Return confirmed");
      fetchIncomingRequests();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to confirm return", "error");
    }
  };

  // OWNER: Send Reminder Email
  const sendReminder = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/request/send-reminder/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Reminder email sent!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send reminder", "error");
    }
  };

  // OWNER: Set Deadline
  const setDeadline = async (id) => {
    const days = prompt("Enter number of days to return the book:");

    if (!days || isNaN(days)) return showToast("Invalid input", "error");

    try {
      await axios.put(
        `http://localhost:5000/api/request/set-return-deadline/${id}`,
        { days: Number(days) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("Return deadline set");
      fetchIncomingRequests();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to set deadline", "error");
    }
  };

  // REQUESTER Cancel
  const handleCancelRequest = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/request/cancel/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast("Request cancelled");
      fetchIncomingRequests();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to cancel", "error");
    }
  };

  const filteredRequests =
    filter === "All" ? requests : requests.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="h-screen bg-zinc-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 px-8 py-8 min-h-screen">
      <h1 className="text-3xl text-yellow-100 mb-6 font-semibold">
        Incoming Requests
      </h1>

      {/* FILTER BUTTONS */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {["All", "Requested", "Accepted", "Rejected", "ReturnRequested", "Returned"].map(
          (item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 py-1 rounded transition-all duration-300 ${
                filter === item
                  ? "bg-blue-500 text-white"
                  : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
              }`}
            >
              {item}
            </button>
          )
        )}
      </div>

      {/* NO REQUESTS */}
      {!filteredRequests.length ? (
        <div className="mt-20 text-center text-zinc-400 text-xl">
          No {filter !== "All" ? filter : ""} requests available.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="bg-zinc-800 p-4 rounded text-center shadow-lg hover:shadow-xl transition-all"
            >
              <img
                src={req.book?.imageUrl || "/fallback-book.png"}
                alt={req.book?.title}
                className="h-40 w-auto rounded mx-auto mb-4 transition-transform duration-300 hover:scale-105"
              />

              <h2 className="text-white text-xl font-semibold">
                {req.book?.title}
              </h2>
              <p className="text-zinc-400 mb-2">{req.book?.author}</p>

              <span
                className={`px-2 py-1 rounded text-sm ${
                  req.status === "Requested"
                    ? "bg-yellow-500 text-black"
                    : req.status === "Accepted"
                    ? "bg-green-600"
                    : req.status === "Rejected"
                    ? "bg-red-600"
                    : req.status === "ReturnRequested"
                    ? "bg-blue-600"
                    : "bg-purple-600"
                }`}
              >
                {req.status}
              </span>

              <p className="text-zinc-300 mt-2 text-sm">
                Requester: {req.requester?.username}
              </p>

              <div className="mt-4 space-y-2">
                {/* OWNER CONTROLS */}
                {req.owner?._id === loggedInUserId && (
                  <>
                    {/* Accept / Reject */}
                    {req.status === "Requested" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(req._id, "Accepted")}
                          className="w-full bg-green-500 text-white py-1 rounded hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req._id, "Rejected")}
                          className="w-full bg-red-500 text-white py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* SEND REMINDER & SET DEADLINE */}
                    {req.status === "Accepted" && (
                      <>
                        <button
                          onClick={() => sendReminder(req._id)}
                          className="w-full bg-yellow-500 text-black py-1 rounded hover:bg-yellow-600"
                        >
                          Send Reminder
                        </button>

                        <button
                          onClick={() => setDeadline(req._id)}
                          className="w-full bg-purple-500 text-white py-1 rounded hover:bg-purple-600"
                        >
                          Set Return Deadline
                        </button>
                      </>
                    )}

                    {/* CONFIRM RETURN */}
                    {req.status === "ReturnRequested" && (
                      <button
                        onClick={() => handleConfirmReturn(req._id)}
                        className="w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600"
                      >
                        Confirm Return
                      </button>
                    )}
                  </>
                )}

                {/* BORROWER CANCEL */}
                {req.status === "Requested" &&
                  req.requester?._id === loggedInUserId && (
                    <button
                      onClick={() => handleCancelRequest(req._id)}
                      className="w-full bg-red-700 text-white py-1 rounded hover:bg-red-800"
                    >
                      Cancel
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomingRequests;
