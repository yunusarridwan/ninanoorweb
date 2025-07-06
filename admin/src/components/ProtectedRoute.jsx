// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ token, children }) => {
  console.log("ProtectedRoute - token value:", token); // Tambahkan ini
  if (!token) {
    console.log("ProtectedRoute - Redirecting to /login because token is falsy."); // Tambahkan ini
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;