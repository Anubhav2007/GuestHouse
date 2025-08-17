import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(authState.user?.role)) {
    // Redirect to a general dashboard or an unauthorized page
    return <Navigate to={authState.user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <Outlet />; // Renders the child route's element
};
export default ProtectedRoute;