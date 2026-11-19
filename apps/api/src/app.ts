import express from 'express';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { apiRouter } from './routes.js';

// The app is created here but not started, so tests can use it without opening a port.
export const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'API is running' });
});

// All API routes live under /api (the web app calls /api/... on the same origin).
app.use('/api', apiRouter);

// These two must stay after every route: 404 for unknown URLs, then the error handler last.
app.use(notFound);
app.use(errorHandler);
