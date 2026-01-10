import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Redirect to home page ( login/signup)
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;