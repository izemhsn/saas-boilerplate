import express, { type NextFunction, type Request, type Response } from 'express';

// The app is created here but not started, so tests can use it without opening a port.
export const app = express();

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API is running' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Any request that didn't match a route above gets a JSON 404
// (instead of Express's default HTML "Cannot GET" page).
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Catches any error thrown in a route (Express 5 also catches errors from async routes).
// Logs the full error on the server, but only sends a generic message to the client,
// so stack traces and database details never leak out.
// Must stay below all the routes.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express only treats a function as an error handler if it takes all 4 arguments
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});
