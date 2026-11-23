import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../app.js';
import { auth } from '../../lib/auth.js';

const fakeUser = {
  id: 'user_123',
  name: 'Ada',
  email: 'ada@example.com',
  emailVerified: false,
  image: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

const fakeSession = {
  id: 'session_123',
  token: 'token_123',
  userId: fakeUser.id,
  expiresAt: new Date('2026-02-01T00:00:00Z'),
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  ipAddress: null,
  userAgent: null,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/users/me', () => {
  it('returns 401 when nobody is signed in', async () => {
    // No session cookie, so Better Auth answers "no session" without touching the database.
    const res = await request(app).get('/api/users/me');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'You must be signed in' });
  });

  it('returns the signed-in user', async () => {
    // Pretend Better Auth found a valid session, so the test needs no database.
    vi.spyOn(auth.api, 'getSession').mockResolvedValue({ user: fakeUser, session: fakeSession });

    const res = await request(app).get('/api/users/me');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ...fakeUser,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });
});
