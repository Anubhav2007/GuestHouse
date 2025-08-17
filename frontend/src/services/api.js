import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service
export const loginUser = (credentials) => apiClient.post('/login', credentials);

// Guesthouse Service
export const fetchGuesthouses = () => apiClient.get('/guesthouses');

// Booking Service
export const requestBooking = (bookingData) => apiClient.post('/bookings/request', bookingData);
export const fetchMyBookings = () => apiClient.get('/bookings/my');
export const cancelUserBooking = (bookingId) => apiClient.post(`/bookings/cancel/${bookingId}`);

// Admin Service
export const fetchAllBookingsAdmin = () => apiClient.get('/admin/bookings/all');
export const fetchPendingBookingsAdmin = () => apiClient.get('/admin/bookings/pending');
export const approveBookingAdmin = (bookingId) => apiClient.post(`/admin/bookings/approve/${bookingId}`);
export const rejectBookingAdmin = (bookingId) => apiClient.post(`/admin/bookings/reject/${bookingId}`);
export const exportDatabaseAdmin = () => apiClient.post('/admin/export-db');

export default apiClient;