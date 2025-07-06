import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, isSuperAdmin } from '../utils/auth';
import UnauthorizedPage from '../routes/UnauthorizedPage'; // Pastikan ini diimpor

const SuperAdminProtectedRoute = ({ children }) => {
  const userIsAuthenticated = isAuthenticated();
  const userIsSuperAdmin = isSuperAdmin();

  // 1. Check if the user is authenticated
  if (!userIsAuthenticated) {
    console.log("SuperAdminProtectedRoute - Redirecting to /login (not authenticated).");
    return <Navigate to="/login" replace />;
  }

  // 2. Check if the user is a superadmin
  if (!userIsSuperAdmin) {
    console.warn("SuperAdminProtectedRoute - Access Denied: User is not a superadmin. Displaying UnauthorizedPage.");
    return <UnauthorizedPage />;
  }
  
  // If the user is authenticated and is a superadmin, render children (protected routes)
  return children ? children : <Outlet />;
};

export default SuperAdminProtectedRoute;
