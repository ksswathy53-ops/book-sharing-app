import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate(); // For redirecting after signup
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    const { username, email, password, address } = formData;

    //  validation
    if (!username || !email || !password || !address) {
      alert("All fields are required!");
      return;
    }

    try {
      console.log("Sending form data:", formData); 
      const response = await axios.post("http://localhost:5000/api/users/sign-up", formData);

      alert("Signup successful! Please login.");
      console.log(response.data);

      // Reset form data
      setFormData({
        username: "",
        email: "",
        password: "",
        address: "",
      });

      // Redirect to login page
      navigate("/LogIn");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="h-auto bg-zinc-900 px-12 py-8 flex items-center justify-center">
      <div className="bg-zinc-800 rounded-lg px-8 py-5 w-full md:w-3/6 lg:w-2/6">
        <p className="text-zinc-200 text-xl font-semibold">SignUp</p>

        <form onSubmit={handleSubmit} className="text-zinc-200 text-xl">
          {/* Username */}
          <div className="mt-4">
            <label className="text-zinc-400">Username</label>
            <input
              type="text"
              className="w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none"
              placeholder="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="mt-4">
            <label className="text-zinc-400">Email</label>
            <input
              type="email"
              className="w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none"
              placeholder="abc@gmail.com"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="mt-4">
            <label className="text-zinc-400">Password</label>
            <input
              type="password"
              className="w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none"
              placeholder="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Address */}
          <div className="mt-4">
            <label className="text-zinc-400">Address</label>
            <textarea
              className="w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none"
              rows="5"
              placeholder="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:text-zinc-800 transition-all duration-300"
            >
              SignUp
            </button>
          </div>
        </form>

        <p className="flex mt-4 items-center justify-center text-zinc-200 font-semibold">
          Or
        </p>

        <p className="flex mt-4 items-center justify-center text-zinc-500 font-semibold">
          Already have an account? &nbsp;
          <Link to="/LogIn" className="hover:text-blue-500">
            <u>Login</u>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
