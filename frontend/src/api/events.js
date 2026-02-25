import api from './axios';

// GET /api/events?search=&category=&page=&limit=
export const getEvents = (params = {}) =>
  api.get('/events', { params }).then((r) => r.data);

// GET /api/events/:id
export const getEventById = (id) =>
  api.get(`/events/${id}`).then((r) => r.data);
