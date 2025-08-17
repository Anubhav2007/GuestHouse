import React, { useState, useEffect, useCallback } from 'react';
import { fetchMyBookings, cancelUserBooking } from '../../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' }); // 'success' or 'error'

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchMyBookings();
      // Assuming guesthouse name might not be directly in my bookings, but it should be via merge on backend
      // Or you'd need another fetch or pass guesthouse data around
      setBookings(response.data.sort((a, b) => new Date(b.booked_at.split('-').reverse().join('-')) - new Date(a.booked_at.split('-').reverse().join('-')))); // Sort by booked_at desc
    } catch (err) {
      setError('Failed to fetch your bookings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async (bookingId) => {
    setActionMessage({ text: '', type: '' });
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await cancelUserBooking(bookingId);
        setActionMessage({ text: response.data.msg || 'Booking cancelled successfully!', type: 'success' });
        loadBookings(); // Refresh the list
      } catch (err) {
        setActionMessage({ text: err.response?.data?.msg || 'Failed to cancel booking.', type: 'error' });
        console.error(err);
      }
    }
  };

  if (loading) return <p className="text-gray-600">Loading your bookings...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="card">
      {actionMessage.text && (
        <div className={`mb-4 p-3 rounded-md text-sm ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {actionMessage.text}
        </div>
      )}
      {bookings.length === 0 ? (
        <p className="text-gray-500">You have no bookings yet.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((booking) => (
            <li key={booking.booking_id} className="p-4 border border-gray-200 rounded-md shadow-sm bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg text-indigo-700">
                    Guesthouse ID: {booking.guesthouse_id} {/* Replace with Guesthouse Name if available */}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Dates: {booking.start_date} to {booking.end_date}
                  </p>
                  <p className="text-sm text-gray-600">
                    Booked On: {booking.booked_at}
                  </p>
                  <p className="text-sm">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        booking.status === 'confirmed' ? 'text-green-600' :
                        booking.status === 'pending' ? 'text-yellow-600' :
                        booking.status === 'cancelled' ? 'text-red-600' :
                        booking.status === 'rejected' ? 'text-red-700' :
                        'text-gray-600'
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </p>
                </div>
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancel(booking.booking_id)}
                    className="btn-danger text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyBookings;