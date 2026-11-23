import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { app } from './app.js';
import { apiDocsEnabled } from './lib/openapi.js';

describe('GET /api/docs/openapi.json', () => {
  it('lists our endpoints and Better Auth endpoints', async () => {
    const res = await request(app).get('/api/docs/openapi.json');

    expect(res.status).toBe(200);
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining(['/api/health', '/api/users/me', '/api/auth/sign-in/email']),
    );
  });

  it('only documents endpoints that exist', async () => {
    const res = await request(app).get('/api/docs/openapi.json');

    // Catches a typo or a stale path in a *.docs.ts file: every documented GET path must reach
    // a route, so it must not get the JSON 404 that unknown URLs get (middleware/not-found.ts).
    // A route may still answer 404 itself (HttpError 404 with its own message), that's fine.
    // {param} parts are filled with a sample value. Better Auth's paths are skipped: it builds
    // them from its own routes, so they can't be stale. Only GET is called, because other
    // methods could change data.
    const ourGetPaths = Object.entries(res.body.paths)
      .filter(([path, pathItem]) => !path.startsWith('/api/auth/') && 'get' in Object(pathItem))
      .map(([path]) => path);

    for (const path of ourGetPaths) {
      const url = path.replace(/\{[^}]+\}/g, 'sample-id');
      const pathRes = await request(app).get(url);
      expect(pathRes.body, path).not.toEqual({ error: 'Not found' });
    }
  });

  it("doesn't ask for login methods the app doesn't use", async () => {
    const res = await request(app).get('/api/docs/openapi.json');

    // Signing in sets a session cookie that the browser sends by itself, so no endpoint
    // should ask for a bearer token or an API key.
    expect(res.body.components.securitySchemes).toBeUndefined();
    for (const pathItem of Object.values<Record<string, object>>(res.body.paths)) {
      for (const operation of Object.values(pathItem)) {
        expect(operation).not.toHaveProperty('security');
      }
    }
  });
});

describe('GET /api/docs', () => {
  it('returns the docs page', async () => {
    const res = await request(app).get('/api/docs');

    expect(res.status).toBe(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain('/api/docs/openapi.json');
  });
});

describe('apiDocsEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is on while developing', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('API_DOCS_ENABLED', '');
    expect(apiDocsEnabled()).toBe(true);
  });

  it('is off in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('API_DOCS_ENABLED', '');
    expect(apiDocsEnabled()).toBe(false);
  });

  it('can be turned on in production with API_DOCS_ENABLED=true', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('API_DOCS_ENABLED', 'true');
    expect(apiDocsEnabled()).toBe(true);
  });

  it('can be turned off while developing with API_DOCS_ENABLED=false', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('API_DOCS_ENABLED', 'false');
    expect(apiDocsEnabled()).toBe(false);
  });
});
