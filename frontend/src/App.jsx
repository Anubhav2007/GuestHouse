import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Shared/Navbar';
import LoginPage from './components/Auth/LoginPage';
import UserDashboard from './components/User/UserDashboard';
// import GuesthouseList from './components/User/GuesthouseList'; // if using sub-routes
// import MyBookings from './components/User/MyBookings'; // if using sub-routes
import AdminDashboard from './components/Admin/AdminDashboard';
import ProtectedRoute from './components/Shared/ProtectedRoute';

function AppContent() {
  const { authState } = useAuth();

  return (
    <>
      <Navbar />
      <main className="mt-4">
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
            <Route path="/dashboard" element={<UserDashboard />}>
              {/* Example sub-routes for UserDashboard if you prefer that structure
              <Route index element={<Navigate to="guesthouses" />} />
              <Route path="guesthouses" element={<GuesthouseList />} />
              <Route path="my-bookings" element={<MyBookings />} />
              */}
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          
          <Route 
            path="/" 
            element={
              authState.isLoading ? <div>Loading...</div> : 
              authState.isAuthenticated ? (
                authState.user?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" />} /> {/* Catch-all */}
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;