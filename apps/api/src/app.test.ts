import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';

// App-wide behavior. Each feature's own tests live next to it in modules/.

describe('auth routes', () => {
  it('are mounted at /api/auth', async () => {
    // Better Auth's health check route, it needs no database.
    const res = await request(app).get('/api/auth/ok');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('unknown routes', () => {
  it('return a JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
