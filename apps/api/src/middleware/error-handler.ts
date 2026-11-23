import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../lib/http-error.js';

// Catches any error thrown in a route (Express 5 also catches errors from async routes).
// Must be added last in app.ts, after all the routes and the 404 handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express only treats a function as an error handler if it takes all 4 arguments
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Bad input: a zod schema rejected the body, params or query.
  if (err instanceof z.ZodError) {
    res.status(400).json({ error: 'Invalid input', details: z.flattenError(err).fieldErrors });
    return;
  }

  // An expected error a service threw on purpose, like a 404 or 409.
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Anything else is a bug. Log the full error on the server, but only send a generic
  // message to the client, so stack traces and database details never leak out.
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}
