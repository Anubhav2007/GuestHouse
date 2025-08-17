import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import GuesthouseList from './GuesthouseList'; // You'll create this
import MyBookings from './MyBookings'; // You'll create this

const UserDashboard = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">User Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2">
             <h2 className="text-2xl font-semibold mb-4 text-gray-600">Available Guesthouses</h2>
             <GuesthouseList />
         </div>
         <div>
             <h2 className="text-2xl font-semibold mb-4 text-gray-600">My Bookings</h2>
             <MyBookings />
         </div>
      </div>
      {/* If you prefer sub-routes for user dashboard sections:
      <nav className="mb-4">
        <Link to="guesthouses" className="mr-2 btn-primary">View Guesthouses</Link>
        <Link to="my-bookings" className="btn-secondary">My Bookings</Link>
      </nav>
      <Outlet />
      */}
    </div>
  );
};
export default UserDashboard;