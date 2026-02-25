import api from './axios';

// GET /api/users/dashboard
export const getDashboardSummary = () =>
  api.get('/users/dashboard').then((r) => r.data);

// GET /api/users/profile
export const getProfile = () =>
  api.get('/users/profile').then((r) => r.data);

// PUT /api/users/profile  { name, email }
export const updateProfile = (data) =>
  api.put('/users/profile', data).then((r) => r.data);

// PUT /api/users/profile/password  { currentPassword, newPassword }
export const changePassword = (data) =>
  api.put('/users/profile/password', data).then((r) => r.data);
