import api from './axios';

// POST /api/bookings  { eventId }
export const createBooking = (eventId) =>
  api.post('/bookings', { eventId }).then((r) => r.data);

// GET /api/bookings/me
export const getMyBookings = () =>
  api.get('/bookings/me').then((r) => r.data);

// DELETE /api/bookings/:id
export const cancelBooking = (id) =>
  api.delete(`/bookings/${id}`).then((r) => r.data);
