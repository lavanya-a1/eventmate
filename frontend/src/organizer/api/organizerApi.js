import api from '../../api/axios';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getOrganizerDashboard = () => api.get('/organizer/dashboard');

// ─── Events (uses the public event routes, organizer-scoped on backend) ───────
export const getOrganizerEvents = (params) => api.get('/organizer/events', { params });

export const createEvent = (data) => {
  if (data instanceof FormData) {
    return api.post('/events', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.post('/events', data);
};

export const updateEvent = (id, data) => {
  if (data instanceof FormData) {
    return api.put(`/events/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.put(`/events/${id}`, data);
};

export const deleteEvent = (id) => api.delete(`/events/${id}`);

// ─── Bookings for a specific event ────────────────────────────────────────────
export const getEventBookings = (eventId, params) => api.get(`/bookings/event/${eventId}`, { params });
export const exportEventAttendees = (eventId) => api.get(`/bookings/event/${eventId}/export`, { responseType: 'blob' });
