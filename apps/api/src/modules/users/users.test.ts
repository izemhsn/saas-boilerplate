import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../../app.js';
import { HttpError } from '../../lib/http-error.js';
import { createUser, getUserById } from './users.service.js';

// Replace the service with fake functions, so these tests check the routes
// without needing a running database.
vi.mock('./users.service.js', () => ({
  getUserById: vi.fn(),
  createUser: vi.fn(),
}));

const fakeUser = {
  id: 1,
  email: 'ada@example.com',
  name: 'Ada',
  createdAt: new Date('2026-01-01T00:00:00Z'),
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/users/:id', () => {
  it('returns the user', async () => {
    vi.mocked(getUserById).mockResolvedValue(fakeUser);

    const res = await request(app).get('/api/users/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...fakeUser, createdAt: '2026-01-01T00:00:00.000Z' });
    expect(getUserById).toHaveBeenCalledWith(1);
  });

  it('returns 400 when the id is not a number', async () => {
    const res = await request(app).get('/api/users/abc');

    expect(res.status).toBe(400);
    expect(getUserById).not.toHaveBeenCalled();
  });

  it('returns 404 when the user does not exist', async () => {
    vi.mocked(getUserById).mockRejectedValue(new HttpError(404, 'User not found'));

    const res = await request(app).get('/api/users/99');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });
});

describe('POST /api/users', () => {
  it('creates a user', async () => {
    vi.mocked(createUser).mockResolvedValue(fakeUser);

    const res = await request(app)
      .post('/api/users')
      .send({ email: 'ada@example.com', name: 'Ada' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe(1);
    expect(createUser).toHaveBeenCalledWith({ email: 'ada@example.com', name: 'Ada' });
  });

  it('returns 400 for an invalid email', async () => {
    const res = await request(app).post('/api/users').send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid input');
    expect(createUser).not.toHaveBeenCalled();
  });
});
