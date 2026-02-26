import api from './axios';

// POST /api/payments/simulate  { bookingId, method }
export const simulatePayment = (bookingId, method = 'Card') =>
  api.post('/payments/simulate', { bookingId, method }).then((r) => r.data);

