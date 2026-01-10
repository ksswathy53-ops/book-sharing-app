import Home from "./pages/home";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navbar/Navbar";
import AllBooks from "./pages/AllBooks";
import SignUp from "./pages/SignUp";
// import LogIn from "./pages/LogIn";
// import LogIn from "./pages/LogIn";
import LogIn from "./pages/Login";
import MyRequests from "./pages/MyRequests";
import Profile from "./pages/Profile";
import IncomingRequests from "./pages/IncomingRequests";
// import BorrowHistory from "./pages/BorrowHistory";
import SearchResults from "./pages/SearchResults";
import AddBook from "./pages/AddBook";
import MyBooks from "./pages/MyBooks";
import BorrowOverview from "./pages/BorrowOverview";
import PrivateRoute from "./Components/PrivateRoute/PrivateRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ViewBookDetails from "./Components/ViewBookDetails/ViewBookDetails";

const App = () => {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route exact path="/" element={<Home />} />
        <Route path="/all-books" element={<AllBooks />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/LogIn" element={<LogIn />} />
        <Route path="/search-books" element={<SearchResults />} />
        <Route path="/view-book-details/:id" element={<ViewBookDetails />} />

        {/* Protected Routes */}
        <Route
          path="/my-requests"
          element={
            <PrivateRoute>
              <MyRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/borrow-overview"
          element={
            <PrivateRoute>
              <BorrowOverview />
            </PrivateRoute>
          }
        />
        <Route
          path="/incoming-requests"
          element={
            <PrivateRoute>
              <IncomingRequests />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/add-book"
          element={
            <PrivateRoute>
              <AddBook />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-books"
          element={
            <PrivateRoute>
              <MyBooks />
            </PrivateRoute>
          }
        />
      </Routes>

      <Footer />
    </Router>
  );
};

export default App;

