import { z } from 'zod';

// Shared pieces for the API docs (see src/docs.ts).
// Each module describes its own endpoints in a *.docs.ts file, using zod schemas like this one.

// Whether the API docs at /api/docs are turned on. By default they're on while developing and
// off in production (NODE_ENV=production, which compose.yaml sets). API_DOCS_ENABLED=true or
// false in apps/api/.env overrides that.
// Why off in production: the page lists every endpoint to anyone, and it loads Scalar's script
// from a CDN on the same site as the session cookie, so a tampered copy of that script could
// call the API as any signed-in user who opens the page. Only turn it on where you trust that.
export function apiDocsEnabled() {
  if (process.env.API_DOCS_ENABLED === 'true') {
    return true;
  }
  if (process.env.API_DOCS_ENABLED === 'false') {
    return false;
  }
  return process.env.NODE_ENV !== 'production';
}

// What the error handler sends for expected errors, like 401 or 404 (see middleware/error-handler.ts).
// "id" makes the docs show it once as "Error" and link to it, instead of repeating it everywhere.
export const errorSchema = z
  .object({
    error: z.string().meta({ example: 'You must be signed in' }),
  })
  .meta({ id: 'Error' });
