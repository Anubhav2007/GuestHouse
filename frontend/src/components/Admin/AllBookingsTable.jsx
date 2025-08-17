import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllBookingsAdmin, approveBookingAdmin, rejectBookingAdmin } from '../../services/api';

const AllBookingsTable = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState({ id: null, text: '', type: '' });

  const loadAllBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchAllBookingsAdmin();
      setBookings(response.data.sort((a, b) => new Date(b.booked_at.split('-').reverse().join('-')) - new Date(a.booked_at.split('-').reverse().join('-')))); // Sort by booked_at desc
    } catch (err) {
      setError('Failed to fetch all bookings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllBookings();
  }, [loadAllBookings]);

  const handleAction = async (bookingId, actionType) => {
    setActionMessage({ id: bookingId, text: 'Processing...', type: 'info' });
    try {
      let response;
      if (actionType === 'approve') {
        response = await approveBookingAdmin(bookingId);
      } else if (actionType === 'reject') {
        response = await rejectBookingAdmin(bookingId);
      }
      setActionMessage({ id: bookingId, text: response.data.msg || `Action ${actionType} successful!`, type: 'success' });
      loadAllBookings(); // Refresh
    } catch (err) {
      setActionMessage({ id: bookingId, text: err.response?.data?.msg || `Failed to ${actionType} booking.`, type: 'error' });
      console.error(err);
    }
  };


  if (loading) return <p className="text-gray-600">Loading all bookings...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="card overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">All Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guesthouse</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked At</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.booking_id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 truncate" title={booking.booking_id}>{booking.booking_id.substring(0,8)}...</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{booking.guesthouse_name || booking.guesthouse_id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.username}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.start_date} - {booking.end_date}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{booking.booked_at}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                   <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        booking.status === 'rejected' ? 'bg-pink-100 text-pink-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(booking.booking_id, 'approve')}
                        className="text-indigo-600 hover:text-indigo-900 mr-2 text-xs"
                        disabled={actionMessage.id === booking.booking_id && actionMessage.type === 'info'}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(booking.booking_id, 'reject')}
                        className="text-red-600 hover:text-red-900 text-xs"
                        disabled={actionMessage.id === booking.booking_id && actionMessage.type === 'info'}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {actionMessage.id === booking.booking_id && actionMessage.text && (
                     <span className={`ml-2 text-xs ${actionMessage.type === 'success' ? 'text-green-600' : actionMessage.type === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
                       {actionMessage.type === 'info' ? 'Processing...' : actionMessage.type === 'success' ? 'Done!' : 'Failed'}
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

export default AllBookingsTable;