const request = require('supertest');
const app = require('../../src/app');

describe('Smoke integration: auth, booking, payment paths', () => {
  test('GET /api/auth/csrf-token returns token and cookie', async () => {
    const response = await request(app).get('/api/auth/csrf-token');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(typeof response.body.csrfToken).toBe('string');
    expect(response.body.csrfToken.length).toBeGreaterThan(10);

    const setCookie = response.headers['set-cookie'] || [];
    expect(setCookie.some((cookie) => cookie.includes('csrf_token='))).toBe(true);
  });

  test('POST /api/auth/login rejects invalid payload', async () => {
    const response = await request(app).post('/api/auth/login').send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  test('POST /api/bookings returns 401 without auth token', async () => {
    const response = await request(app).post('/api/bookings').send({ eventId: '507f1f77bcf86cd799439011' });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('No auth token');
  });

  test('POST /api/payments/simulate returns 401 without auth token', async () => {
    const response = await request(app)
      .post('/api/payments/simulate')
      .send({ bookingId: '507f1f77bcf86cd799439011', method: 'card' });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('No auth token');
  });
});
