import { fromNodeHeaders } from 'better-auth/node';
import type { NextFunction, Request, Response } from 'express';
import { auth } from '../lib/auth.js';
import { HttpError } from '../lib/http-error.js';

// The signed-in user and their session, with the types Better Auth gives them.
type AuthSession = typeof auth.$Infer.Session;

// Tell TypeScript that res.locals.user and res.locals.session exist in every route.
// requireAuth fills them in, so only use them in routes that run after requireAuth.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- this is how Express's own types are extended
  namespace Express {
    interface Locals {
      user: AuthSession['user'];
      session: AuthSession['session'];
    }
  }
}

// Only lets signed-in users through:
//   router.get('/me', requireAuth, handler)
// Better Auth reads the session cookie from the request headers and looks the session up.
// No session (not signed in, or it expired): 401. Otherwise the route can use res.locals.user.
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const result = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

  if (!result) {
    throw new HttpError(401, 'You must be signed in');
  }

  res.locals.user = result.user;
  res.locals.session = result.session;
  next();
}
