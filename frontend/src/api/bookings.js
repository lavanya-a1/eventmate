import api from './axios';

// POST /api/bookings  { eventId, seats }
export const createBooking = (eventId, seats = 1) =>
  api.post('/bookings', { eventId, seats }).then((r) => r.data);

// GET /api/bookings/me
export const getMyBookings = () =>
  api.get('/bookings/me').then((r) => r.data);

// DELETE /api/bookings/:id
export const cancelBooking = (id) =>
  api.delete(`/bookings/${id}`).then((r) => r.data);
