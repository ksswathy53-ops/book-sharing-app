import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const LogIn = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        username,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/");
        window.location.reload();
      }
    } catch (err) {
      alert("Invalid username or password!");
      console.error(err);
    }
  };

  return (
    <>
      <div className="h-screen bg-zinc-900 px-12 py-8 flex items-center justify-center">
        <div className="bg-zinc-800 rounded-lg px-8 py-5 w-full md:w-3/6 lg:w-2/6 ">
          <p className="text-zinc-200 text-xl">LogIn</p>
          
          <div className="text-zinc-200 text-xl">

            {/* Username */}
            <div className="mt-4">
              <label className="text-zinc-400">Username</label>
              <input
                type="text"
                className="w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none"
                placeholder="username"
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="mt-4">
              <label className="text-zinc-400">Password</label>
              <input
                type="password"
                className="w-full mt-2 bg-zinc-900 text-zinc-100 p-2 outline-none"
                placeholder="password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* LOGIN BUTTON */}
            <div className="mt-4">
              <button
                onClick={handleLogin}
                className="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:text-zinc-800"
              >
                LogIn
              </button>
            </div>

            <p className="flex mt-4 items-center justify-center text-zinc-200 font-semibold">
              Or
            </p>

            <p className="flex mt-4 items-center justify-center text-zinc-500 font-semibold">
              Don't have an account? &nbsp;
              <Link to="/SignUp" className="hover:text-blue-500">
                <u>SignUp</u>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogIn;
