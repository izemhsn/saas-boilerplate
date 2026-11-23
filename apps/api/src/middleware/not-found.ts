import type { Request, Response } from 'express';

// Any request that didn't match a route gets a JSON 404
// (instead of Express's default HTML "Cannot GET" page).
// Must be added after all the routes in app.ts.
export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}
