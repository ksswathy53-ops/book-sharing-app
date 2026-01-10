import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Components/Loader/Loader";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    address: "",
  });

  // Password form states
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [stats, setStats] = useState({
    borrowedCount: 0,
    sharedCount: 0,
    returnedCount: 0,
  });

  const token = localStorage.getItem("token");

  //  PROFILE + STATS
  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
      setForm({
        username: res.data.user.username,
        email: res.data.user.email,
        address: res.data.user.address,
      });

      // Load Stats
      const statsRes = await axios.get(
        "http://localhost:5000/api/profile/stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update frontend keys to match backend response
      setStats({
        borrowedCount: statsRes.data.stats.borrowedBooks || 0,
        sharedCount: statsRes.data.stats.ownedBooks || 0,
        returnedCount: statsRes.data.stats.totalRequests || 0,
      });

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // UPDATE PROFILE
  const handleUpdate = async () => {
    setSaving(true);
    try {
      await axios.put(
        "http://localhost:5000/api/profile/update",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profile updated successfully");
      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    }
    setSaving(false);
  };

  // CHANGE AVATAR/PROFILE PIC
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await axios.put(
        "http://localhost:5000/api/profile/update-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Avatar updated successfully");
      setUser(res.data.user); // Updates user  to show new avatar
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update avatar");
    }
  };

  // CHANGE PASSWORD
  const handleChangePassword = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/profile/change-password",
        passwordForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Password changed successfully");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Password change failed");
    }
  };

  // DELETE ACCOUNT
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await axios.delete("http://localhost:5000/api/profile/delete", {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Account deleted");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete account");
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center bg-zinc-900">
        <Loader />
      </div>
    );

  return (
    <div className="bg-zinc-900 min-h-screen px-8 py-12 flex justify-center">
      <div className="bg-zinc-800 p-8 rounded-xl w-full max-w-3xl shadow-xl space-y-10">

        {/* HEADER + AVATAR */}
        <div className="text-center">
          <h1 className="text-3xl text-yellow-100 font-semibold">
            My Profile
          </h1>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt="avatar"
            className="w-28 h-28 rounded-full border-4 border-yellow-100"
          />
          <label className="bg-blue-600 px-4 py-1 mt-3 text-white rounded cursor-pointer hover:bg-blue-700">
            Change Avatar
            <input type="file" className="hidden" onChange={handleAvatarUpload} />
          </label>
        </div>

        {/* PROFILE STATS */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-zinc-700 p-4 rounded-lg">
            <p className="text-2xl text-yellow-300">{stats.borrowedCount}</p>
            <p className="text-zinc-300 text-sm">Borrowed</p>
          </div>

          <div className="bg-zinc-700 p-4 rounded-lg">
            <p className="text-2xl text-yellow-300">{stats.sharedCount}</p>
            <p className="text-zinc-300 text-sm">Shared</p>
          </div>

          <div className="bg-zinc-700 p-4 rounded-lg">
            <p className="text-2xl text-yellow-300">{stats.returnedCount}</p>
            <p className="text-zinc-300 text-sm">Returned</p>
          </div>
        </div>

        {/* PROFILE UPDATE FORM */}
        <div className="space-y-4">
          <h2 className="text-xl text-white font-semibold">Profile Info</h2>

          {/* USERNAME */}
          <div>
            <label className="text-zinc-300 text-sm">Username</label>
            <input
              type="text"
              className="w-full p-2 mt-1 rounded bg-zinc-700 text-white"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-zinc-300 text-sm">Email</label>
            <input
              type="email"
              className="w-full p-2 mt-1 rounded bg-zinc-700 text-white"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-zinc-300 text-sm">Address</label>
            <textarea
              className="w-full p-2 mt-1 rounded bg-zinc-700 text-white"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <button
            onClick={handleUpdate}
            className="mt-4 w-full bg-yellow-500 text-black py-2 rounded font-semibold hover:bg-yellow-400"
          >
            {saving ? "Saving..." : "Update Profile"}
          </button>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="bg-zinc-700 p-6 rounded-xl space-y-3">
          <h2 className="text-xl text-white font-semibold">Change Password</h2>

          <input
            type="password"
            placeholder="Old Password"
            className="w-full p-2 rounded bg-zinc-800 text-white"
            value={passwordForm.oldPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="New Password"
            className="w-full p-2 rounded bg-zinc-800 text-white"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
          />

          <button
            onClick={handleChangePassword}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Change Password
          </button>
        </div>

        {/* DELETE ACCOUNT */}
        <div className="text-center">
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Delete My Account
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
