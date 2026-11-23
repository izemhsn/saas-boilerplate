import { toNodeHandler } from 'better-auth/node';
import express from 'express';
import { auth } from './lib/auth.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { apiRouter } from './routes.js';

// The app is created here but not started, so tests can use it without opening a port.
export const app = express();

// The API runs behind one proxy (nginx in Docker, Vite in dev). This tells Express to trust
// the X-Forwarded-* headers from that one proxy, so req.ip is the visitor's IP and
// req.secure is true for https visitors (secure cookies need this).
// The number is how many proxies sit in front of the API. If you add another one on the
// server (for example Caddy or a load balancer for https), change it to 2, and also set
// advanced.ipAddress.trustedProxies in lib/auth.ts. Better Auth reads the visitor's IP on its own
// (for its sign-in rate limit) and only trusts a single IP in X-Forwarded-For unless you list
// the proxies, so without it every visitor would share one rate limit.
app.set('trust proxy', 1);

// Better Auth's own routes: sign up, sign in, sign out, get session...
// (for example POST /api/auth/sign-up/email). "*splat" matches everything after /api/auth/.
// This must come before express.json(): Better Auth reads the request body itself,
// and express.json() would use it up first, making these requests hang.
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'API is running' });
});

// All API routes live under /api (the web app calls /api/... on the same origin).
app.use('/api', apiRouter);

// These two must stay after every route: 404 for unknown URLs, then the error handler last.
app.use(notFound);
app.use(errorHandler);
