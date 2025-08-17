import React, { useState, useEffect, useCallback } from 'react';
import { fetchPendingBookingsAdmin, approveBookingAdmin, rejectBookingAdmin } from '../../services/api';

const PendingApprovalsTable = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState({ id: null, text: '', type: '' }); // type: 'info', 'success', 'error'

  const loadPendingBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setActionMessage({ id: null, text: '', type: '' }); // Clear previous messages
      const response = await fetchPendingBookingsAdmin();
      // Backend should already filter for pending, sort by booked_at
      setBookings(response.data.sort((a, b) => new Date(a.booked_at.split('-').reverse().join('-')) - new Date(b.booked_at.split('-').reverse().join('-')))); // Sort by booked_at asc for pending
    } catch (err) {
      setError('Failed to fetch pending bookings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingBookings();
  }, [loadPendingBookings]);

  const handleAction = async (bookingId, actionType) => {
    setActionMessage({ id: bookingId, text: 'Processing...', type: 'info' });
    try {
      let response;
      if (actionType === 'approve') {
        response = await approveBookingAdmin(bookingId);
      } else if (actionType === 'reject') {
        response = await rejectBookingAdmin(bookingId);
      }
      setActionMessage({ id: bookingId, text: response.data.msg || `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} successful!`, type: 'success' });
      // Refresh list after action
      loadPendingBookings();
    } catch (err) {
      setActionMessage({ id: bookingId, text: err.response?.data?.msg || `Failed to ${actionType} booking.`, type: 'error' });
      console.error(err);
    }
  };

  if (loading) return <p className="text-gray-600">Loading pending approvals...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="card overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Pending Booking Approvals</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500">No pending approvals at the moment.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guesthouse</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Dates</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked At</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.booking_id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 truncate" title={booking.booking_id}>{booking.booking_id.substring(0,8)}...</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{booking.guesthouse_name || booking.guesthouse_id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.username}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.start_date} to {booking.end_date}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.booked_at}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleAction(booking.booking_id, 'approve')}
                    className="btn-primary text-xs mr-2" // Using btn-primary for approve
                    disabled={actionMessage.id === booking.booking_id && actionMessage.type === 'info'}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(booking.booking_id, 'reject')}
                    className="btn-danger text-xs" // Using btn-danger for reject
                    disabled={actionMessage.id === booking.booking_id && actionMessage.type === 'info'}
                  >
                    Reject
                  </button>
                  {actionMessage.id === booking.booking_id && actionMessage.text && (
                     <span className={`ml-2 text-xs ${actionMessage.type === 'success' ? 'text-green-600' : actionMessage.type === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
                       {actionMessage.type === 'info' ? 'Processing...' : actionMessage.text}
                     </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingApprovalsTable;