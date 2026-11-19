import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';

// App-wide behavior. Each feature's own tests live next to it in modules/.

describe('unknown routes', () => {
  it('return a JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
