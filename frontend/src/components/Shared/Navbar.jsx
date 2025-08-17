import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-gray-300">
          NEEPCO Guesthouses
        </Link>
        <div>
          {authState.isAuthenticated ? (
            <>
              <span className="mr-4">Welcome, {authState.user?.username} ({authState.user?.role})</span>
              {authState.user?.role === 'admin' ? (
                <Link to="/admin" className="mr-3 hover:text-gray-300">Admin Dashboard</Link>
              ) : (
                <Link to="/dashboard" className="mr-3 hover:text-gray-300">My Dashboard</Link>
              )}
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;