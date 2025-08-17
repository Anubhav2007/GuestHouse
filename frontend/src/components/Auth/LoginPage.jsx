import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/api';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { authState, login, logout } = useAuth(); // Get authState, login, and logout
  const navigate = useNavigate();

  // Effect to handle dialog if user lands on login page while authenticated
  // This runs once when the component mounts or when authState.isAuthenticated changes.
  useEffect(() => {
    if (authState.isAuthenticated) {
      // This is the modal dialog part
      // It will show *before* the Navigate component below takes effect if the user somehow lands here.
      const wantsToStayOrLogout = window.confirm(
        "You are already logged in.\n\n- Click 'OK' to proceed to your dashboard.\n- Click 'Cancel' to log out and stay on the login page."
      );

      if (wantsToStayOrLogout) {
        // User wants to go to their dashboard. The <Navigate> component below will handle this.
        // No specific action needed here other than letting the component re-render.
      } else {
        // User clicked 'Cancel', so log them out.
        logout();
        // After logout, they will remain on the login page as authState.isAuthenticated will be false.
        // The page will re-render, and the <Navigate> logic won't trigger a redirect.
      }
    }
  }, [authState.isAuthenticated, logout, navigate]); // navigate is included if you were to use it inside

  // If user is authenticated AND they chose to proceed to dashboard (or didn't cancel logout prompt)
  // this Navigate component will redirect them.
  // This also handles the case where the prompt was skipped or already handled.
  if (authState.isAuthenticated) {
    // Check if the logout() call in the useEffect has already set isAuthenticated to false.
    // If logout() was called, authState.isAuthenticated would be false now, and this block wouldn't run.
    // So, this block effectively runs if the user chose "OK" in the confirm dialog
    // or if they arrived here authenticated and the useEffect hasn't run yet or didn't lead to logout.
    if (authState.user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // If we reach here, the user is not authenticated, so we show the login form.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await loginUser({ username, password });
      const { access_token, role, username: loggedInUsername } = response.data;
      login(access_token, { username: loggedInUsername, role });
      // After successful login, the component will re-render.
      // The `authState.isAuthenticated` will become true.
      // The `useEffect` and the `Navigate` component logic at the top will then take care of redirection.
      // So, explicit navigation here might be redundant but can be kept for clarity if preferred.
      // if (role === 'admin') {
      //   navigate('/admin', { replace: true });
      // } else {
      //   navigate('/dashboard', { replace: true });
      // }
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            NEEPCO Guest House Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username_field" className="sr-only">Username</label>
              <input
                id="username_field"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="input-field rounded-t-md"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password_field" className="sr-only">Password</label>
              <input
                id="password_field"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field rounded-b-md"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <button type="submit" className="btn-primary w-full">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;