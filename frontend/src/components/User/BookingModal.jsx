import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker'; // Import DatePicker
import "react-datepicker/dist/react-datepicker.css"; // Import default styles
import { format, parse, isValid, isBefore, startOfDay } from 'date-fns'; // For date manipulation

const BookingModal = ({ isOpen, onClose, guesthouse, onSubmit, bookingStatus }) => {
  // State will now hold Date objects for the pickers
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [localError, setLocalError] = useState('');

  // Reset form when guesthouse changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setLocalError('');
    }
  }, [isOpen, guesthouse]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!selectedStartDate || !selectedEndDate) {
      setLocalError('Both start and end dates are required.');
      return;
    }

    // Format Date objects to "dd-MM-yyyy" string for submission
    const formattedStartDate = format(selectedStartDate, 'dd-MM-yyyy');
    const formattedEndDate = format(selectedEndDate, 'dd-MM-yyyy');
    
    onSubmit(guesthouse.id, formattedStartDate, formattedEndDate);
  };

  if (!isOpen) return null;

  const today = startOfDay(new Date()); // Get today's date at midnight

  // Handle start date change to clear end date if it becomes invalid
  const handleStartDateChange = (date) => {
    setSelectedStartDate(date);
    if (selectedEndDate && isBefore(selectedEndDate, date)) {
      setSelectedEndDate(null); // Clear end date if it's before the new start date
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
      <div className="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
            Book: {guesthouse.name}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Location: {guesthouse.location} | Capacity: {guesthouse.capacity}
          </p>

          {bookingStatus && bookingStatus.message && (
             <div className={`mb-4 p-2 rounded-md text-sm ${bookingStatus.type === 'success' ? 'bg-green-100 text-green-700' : bookingStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {bookingStatus.message}
             </div>
          )}
          {localError && (
            <p className="text-red-500 text-sm mb-3">{localError}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left"> {/* text-left for labels */}
            <div>
              <label htmlFor="start_date_picker" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <DatePicker
                id="start_date_picker"
                selected={selectedStartDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={selectedStartDate}
                endDate={selectedEndDate}
                minDate={today} // Cannot select past dates
                dateFormat="dd-MM-yyyy"
                placeholderText="Select start date"
                className="input-field w-full" // Apply your existing input style
                wrapperClassName="w-full" // Ensure wrapper takes full width
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="end_date_picker" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <DatePicker
                id="end_date_picker"
                selected={selectedEndDate}
                onChange={(date) => setSelectedEndDate(date)}
                selectsEnd
                startDate={selectedStartDate}
                endDate={selectedEndDate}
                minDate={selectedStartDate || today} // End date cannot be before start date or today
                dateFormat="dd-MM-yyyy"
                placeholderText="Select end date"
                className="input-field w-full"
                wrapperClassName="w-full"
                disabled={!selectedStartDate} // Disable until start date is selected
                autoComplete="off"
              />
            </div>
            <div className="items-center gap-2 pt-3">
              <button
                type="submit"
                className="btn-primary w-full mb-2"
                disabled={bookingStatus.type === 'info' || !selectedStartDate || !selectedEndDate} // Disable if submitting or dates not selected
              >
                {bookingStatus.type === 'info' ? 'Processing...' : 'Request Booking'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;