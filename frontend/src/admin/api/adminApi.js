import api from '../../api/axios';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/dashboard');
export const getRecentActivity = () => api.get('/admin/dashboard/activity');

// ─── Events ───────────────────────────────────────────────────────────────────
export const getAdminEvents = (params) => api.get('/admin/events', { params });
export const createEvent = (data) => {
  if (data instanceof FormData) {
    return api.post('/admin/events', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.post('/admin/events', data);
};

export const updateEvent = (id, data) => {
  if (data instanceof FormData) {
    return api.put(`/admin/events/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.put(`/admin/events/${id}`, data);
};

export const deleteEvent = (id) => api.delete(`/admin/events/${id}`);
export const toggleEventStatus = (id) => api.patch(`/admin/events/${id}/status`);

// ─── Users ────────────────────────────────────────────────────────────────────
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const toggleUserBlock = (id) => api.patch(`/admin/users/${id}/block`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getUserBookings = (id) => api.get(`/admin/users/${id}/bookings`);

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const getAdminBookings = (params) => api.get('/admin/bookings', { params });
export const cancelBooking = (id) => api.patch(`/admin/bookings/${id}/cancel`);
export const exportBookings = (params) => api.get('/admin/bookings/export', { params, responseType: 'blob' });

// ─── Payments ─────────────────────────────────────────────────────────────────
export const getPayments = (params) => api.get('/admin/payments', { params });
export const getRevenueAnalytics = () => api.get('/admin/payments/analytics');

// ─── QR / Tickets ─────────────────────────────────────────────────────────────
export const validateQR = (ticketId) => api.post('/qr/validate', { ticketId });
export const getAttendance = (eventId) => api.get(`/admin/events/${eventId}/attendance`);

// ─── Notifications ────────────────────────────────────────────────────────────
export const getAdminNotifications = (params) => api.get('/admin/notifications', { params });
export const broadcastNotification = (data) => api.post('/admin/notifications/broadcast', data);
export const scheduleReminder = (data) => api.post('/admin/notifications/reminder', data);
export const deleteNotification = (id) => api.delete(`/admin/notifications/${id}`);

// ─── Feedback ─────────────────────────────────────────────────────────────────
export const getAdminFeedback = (params) => api.get('/admin/feedback', { params });
export const moderateFeedback = (id, status) => api.patch(`/admin/feedback/${id}/moderate`, { status });
export const deleteFeedback = (id) => api.delete(`/admin/feedback/${id}`);

// ─── System Logs ──────────────────────────────────────────────────────────────
export const getSystemLogs = (params) => api.get('/admin/logs', { params });

// ─── Settings ─────────────────────────────────────────────────────────────────
export const getAdminProfile = () => api.get('/admin/settings/profile');
export const updateAdminProfile = (data) => api.put('/admin/settings/profile', data);
export const changePassword = (data) => api.put('/admin/settings/password', data);
