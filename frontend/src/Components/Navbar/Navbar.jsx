

import { Link, useNavigate } from "react-router-dom";
import { FaGripLines, FaChevronDown } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { CiSearch } from "react-icons/ci";

const Navbar = () => {
  const [mobileNav, setMobileNav] = useState("hidden");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  //   CLOSE DROPDOWN ON OUTSIDE CLICK  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

//  CHECK LOGIN 
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  //  DISABLE SCROLL WHEN NAV IS OPEN 
  useEffect(() => {
    if (mobileNav === "block") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [mobileNav]);


  // SEARCH 
  const handleSearch = () => {
    if (searchQuery.trim() === "") return;
    navigate(`/search-books?name=${searchQuery}`);
    setSearchQuery("");
    setMobileNav("hidden");
  };

  //  LOGOUT 
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setOpenDropdown(false);
    setMobileNav("hidden");
    navigate("/");
  };



  return (
    <>
      {/* Navbar Main */}
      <nav className="z-50 relative flex bg-zinc-800 text-white px-8 py-4 items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            className="h-10 me-4 rounded"
            src="https://i.pinimg.com/736x/12/f3/f4/12f3f4ecc8d00b48041062625fa9ebed.jpg"
            alt="logo"
          />
          <h1 className="text-2xl font-semibold hover:text-blue-400">Foliora</h1>
        </Link>


        {/* Desktop Links */}
        <div className="nav-links-foliora block md:flex items-center gap-4">
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/" className="hover:text-blue-500 transition-all">Home</Link>
            <Link to="/all-books" className="hover:text-blue-500 transition-all">All Books</Link>

            {/* Search Box */}
            <div className="flex items-center bg-zinc-700 rounded px-3 py-1">
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-white placeholder:text-zinc-400 w-32"
              />
              <button onClick={handleSearch} className="ml-2 text-blue-400 hover:text-blue-500">
                <CiSearch size={20} />
              </button>
            </div>


            {/* Requests Dropdown */}
            {isLoggedIn && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className="flex items-center gap-2 hover:text-blue-400"
                >
                  Requests <FaChevronDown size={14} />
                </button>

                {openDropdown && (
                  <div className="absolute mt-2 bg-zinc-800 rounded shadow-lg w-52 py-2">
                    <Link to="/my-requests" onClick={() => setOpenDropdown(false)} className="block px-4 py-2 hover:bg-zinc-700">My Requests</Link>
                    <Link to="/incoming-requests" onClick={() => setOpenDropdown(false)} className="block px-4 py-2 hover:bg-zinc-700">Incoming Requests</Link>
                    <Link to="/borrow-overview" onClick={() => setOpenDropdown(false)} className="block px-4 py-2 hover:bg-zinc-700">Borrow Overview</Link>
                    <Link to="/my-books" onClick={() => setOpenDropdown(false)} className="block px-4 py-2 hover:bg-zinc-700">My Books</Link>
                    <Link to="/add-book" onClick={() => setOpenDropdown(false)} className="block px-4 py-2 hover:bg-zinc-700">Add Book</Link>
                  </div>
                )}
              </div>
            )}

            {/* Profile */}
            {isLoggedIn && (
              <Link to="/profile" className="hover:text-blue-500 transition-all duration-300">Profile</Link>
            )}
          </div>


          {/* Login / Logout Desktop */}
          <div className="hidden md:flex gap-4">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="px-4 py-1 bg-red-500 rounded hover:text-zinc-800 transition">Logout</button>
            ) : (
              <>
                <Link to="/LogIn" className="px-4 py-1 bg-blue-500 rounded">LogIn</Link>
                <Link to="/SignUp" className="px-4 py-1 bg-blue-500 rounded">SignUp</Link>
              </>
            )}
          </div>


          {/* side nav Button */}
          <button
            className="block md:hidden text-white text-2xl"
            onClick={() => setMobileNav(mobileNav === "hidden" ? "block" : "hidden")}
          >
            <FaGripLines />
          </button>
        </div>
      </nav>


      {/* MOBILE NAVBAR */}
      <div className={`${mobileNav} bg-zinc-800 h-screen absolute top-0 left-0 w-full z-40 
      flex flex-col items-center justify-center overflow-y-auto`}>

        {/* Mobile Search */}
        <div className="flex items-center bg-zinc-700 rounded px-4 py-2 mt-2 mb-6 w-3/4">
          <input
            type="text"
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-white placeholder:text-zinc-400 w-full"
          />
          <button onClick={handleSearch} className="text-blue-400 text-2xl ml-2"><CiSearch size={20} /></button>
        </div>

        <Link to="/" className="text-white text-4xl mb-8 hover:text-blue-400" onClick={() => setMobileNav("hidden")}>Home</Link>
        <Link to="/all-books" className="text-white text-4xl mb-8 hover:text-blue-400" onClick={() => setMobileNav("hidden")}>All Books</Link>

        {isLoggedIn && (
          <>
            <Link to="/my-requests" className="text-white text-4xl mb-8 hover:text-blue-400" onClick={() => setMobileNav("hidden")}>My Requests</Link>
            <Link to="/incoming-requests" className="text-white text-4xl mb-8 hover:text-blue-400" onClick={() => setMobileNav("hidden")}>Incoming Requests</Link>
            <Link to="/borrow-overview" className="text-white text-4xl mb-8 hover:text-blue-400" onClick={() => setMobileNav("hidden")}>Borrow Overview</Link>
            <Link to="/my-books" className="text-white text-4xl mb-8 hover:text-blue-400" onClick={() => setMobileNav("hidden")}>My Books</Link>
            <Link to="/add-book" className="text-white text-4xl mb-8 hover:text-blue-400" onClick={() => setMobileNav("hidden")}>Add Book</Link>
            <Link to="/profile" className="text-white text-4xl mb-8 hover:text-blue-400" onClick={() => setMobileNav("hidden")}>Profile</Link>
          </>
        )}


        {/* Mobile Login/Logout */}
        <div className="flex flex-col items-center">
          {isLoggedIn ? (
            <button
              onClick={() => { handleLogout(); setMobileNav("hidden"); }}
              className="px-8 py-2 mb-8 text-3xl bg-red-500 rounded text-white"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/LogIn" className="px-8 py-2 mb-8 text-3xl bg-blue-500 rounded text-white" onClick={() => setMobileNav("hidden")}>LogIn</Link>
              <Link to="/SignUp" className="px-8 py-2 mb-8 text-3xl bg-blue-500 rounded text-white" onClick={() => setMobileNav("hidden")}>SignUp</Link>
            </>
          )}
        </div>

      </div>
    </>
  );
};

export default Navbar;

