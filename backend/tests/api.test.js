require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('WorkSphere API Smoke & Security Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /health returns 200 OK', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('WorkSphere API');
  });

  test('GET /api/v1/employees without token returns 401', async () => {
    const res = await request(app).get('/api/v1/employees');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Access denied. No token provided.');
  });

  test('GET /api/v1/dashboard/stats without token returns 401', async () => {
    const res = await request(app).get('/api/v1/dashboard/stats');

    expect(res.statusCode).toBe(401);
  });

  test('POST /api/v1/auth/login with invalid payload returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});