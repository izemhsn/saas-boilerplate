import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';

// Mounted at /api/users (see routes.ts).
// Signing up and signing in are handled by Better Auth at /api/auth/* (see app.ts),
// so this module only has routes for the user who is already signed in.
export const usersRouter = Router();

// GET /api/users/me: the signed-in user. requireAuth sends a 401 if nobody is signed in.
usersRouter.get('/me', requireAuth, (_req, res) => {
  res.json(res.locals.user);
});
