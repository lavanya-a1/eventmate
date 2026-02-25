import api from './axios';

// GET /api/notifications
export const getNotifications = () =>
  api.get('/notifications').then((r) => r.data);

// POST /api/notifications/read/:id
export const markAsRead = (id) =>
  api.post(`/notifications/read/${id}`).then((r) => r.data);

// POST /api/notifications/read-all
export const markAllAsRead = () =>
  api.post('/notifications/read-all').then((r) => r.data);
