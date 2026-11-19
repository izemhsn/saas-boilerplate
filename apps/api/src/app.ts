import express from 'express';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { apiRouter } from './routes.js';

// The app is created here but not started, so tests can use it without opening a port.
export const app = express();

// The API runs behind one proxy (nginx in Docker, Vite in dev). This tells Express to trust
// the X-Forwarded-* headers from that one proxy, so req.ip is the visitor's IP and
// req.secure is true for https visitors (secure cookies need this).
// The number is how many proxies sit in front of the API. If you add another one on the
// server (for example Caddy or a load balancer for https), change it to 2.
app.set('trust proxy', 1);

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'API is running' });
});

// All API routes live under /api (the web app calls /api/... on the same origin).
app.use('/api', apiRouter);

// These two must stay after every route: 404 for unknown URLs, then the error handler last.
app.use(notFound);
app.use(errorHandler);
