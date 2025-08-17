import React, { useState, useEffect } from 'react';
import { fetchGuesthouses, requestBooking } from '../../services/api';
import GuesthouseCard from './GuesthouseCard';
import BookingModal from './BookingModal';

const GuesthouseList = () => {
  const [guesthouses, setGuesthouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGuesthouse, setSelectedGuesthouse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({ message: '', type: '' }); // 'success' or 'error'

  useEffect(() => {
    const loadGuesthouses = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchGuesthouses();
        setGuesthouses(response.data);
      } catch (err) {
        setError('Failed to fetch guesthouses. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadGuesthouses();
  }, []);

  const handleBookClick = (guesthouse) => {
    setSelectedGuesthouse(guesthouse);
    setIsModalOpen(true);
    setBookingStatus({ message: '', type: '' }); // Reset status when opening modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGuesthouse(null);
  };

  const handleBookingSubmit = async (guesthouseId, startDate, endDate) => {
    try {
      setBookingStatus({ message: 'Submitting request...', type: 'info' });
      const response = await requestBooking({ guesthouse_id: guesthouseId, start_date: startDate, end_date: endDate });
      setBookingStatus({ message: response.data.msg || 'Booking request submitted successfully!', type: 'success' });
      // Optionally close modal on success or let user close it
      // setIsModalOpen(false); 
      // setSelectedGuesthouse(null);
      // You might want to refresh MyBookings or show a persistent success message
    } catch (err) {
      setBookingStatus({ message: err.response?.data?.msg || 'Booking failed. Please check dates or availability.', type: 'error' });
      console.error(err);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Loading guesthouses...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      {bookingStatus.message && (
        <div className={`p-3 rounded-md ${bookingStatus.type === 'success' ? 'bg-green-100 text-green-700' : bookingStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {bookingStatus.message}
        </div>
      )}
      {guesthouses.length === 0 && !loading && (
        <p className="text-center text-gray-500">No guesthouses available at the moment.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guesthouses.map((guesthouse) => (
          <GuesthouseCard
            key={guesthouse.id}
            guesthouse={guesthouse}
            onBook={() => handleBookClick(guesthouse)}
          />
        ))}
      </div>
      {selectedGuesthouse && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          guesthouse={selectedGuesthouse}
          onSubmit={handleBookingSubmit}
          bookingStatus={bookingStatus} // Pass status to modal if needed for display there too
        />
      )}
    </div>
  );
};

export default GuesthouseList;