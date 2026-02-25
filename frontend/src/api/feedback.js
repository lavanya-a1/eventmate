import api from './axios';

// POST /api/feedback  { event, rating, comment }
export const submitFeedback = (payload) =>
  api.post('/feedback', payload).then((r) => r.data);

// GET /api/feedback/my
export const getMyFeedback = () =>
  api.get('/feedback/my').then((r) => r.data);
