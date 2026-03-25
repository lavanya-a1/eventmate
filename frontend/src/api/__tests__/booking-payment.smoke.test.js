import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createBooking, getMyBookings, cancelBooking } from '../bookings';
import { simulatePayment } from '../payments';
import api from '../axios';

vi.mock('../axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Smoke: booking and payment API modules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls booking creation endpoint with expected payload', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    await createBooking('event-123', 2);

    expect(api.post).toHaveBeenCalledWith('/bookings', { eventId: 'event-123', seats: 2 });
  });

  it('calls my-bookings endpoint', async () => {
    api.get.mockResolvedValue({ data: { success: true, data: [] } });

    await getMyBookings();

    expect(api.get).toHaveBeenCalledWith('/bookings/me');
  });

  it('calls cancel booking endpoint', async () => {
    api.delete.mockResolvedValue({ data: { success: true } });

    await cancelBooking('booking-123');

    expect(api.delete).toHaveBeenCalledWith('/bookings/booking-123');
  });

  it('calls payment simulate endpoint', async () => {
    api.post.mockResolvedValue({ data: { success: true } });

    await simulatePayment('booking-123', 'card');

    expect(api.post).toHaveBeenCalledWith('/payments/simulate', { bookingId: 'booking-123', method: 'card' });
  });
});
