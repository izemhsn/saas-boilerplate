import { Router } from 'express';
import { requireAuth } from '../../middleware/require-auth.js';

// Mounted at /api/users (see routes.ts).
// Signing up and signing in are handled by Better Auth at /api/auth/* (see app.ts),
// so this module only has routes for the user who is already signed in.
export const usersRouter = Router();

// GET /api/users/me: the signed-in user. requireAuth sends a 401 if nobody is signed in.
// Only these fields are sent, not the whole row: a column added to the users table later
// (a role, a Stripe customer id...) must not reach the browser unless it's added here on purpose.
// Keep this list in sync with currentUserSchema in users.docs.ts.
usersRouter.get('/me', requireAuth, (_req, res) => {
  const { id, name, email, emailVerified, image, createdAt, updatedAt } = res.locals.user;
  res.json({ id, name, email, emailVerified, image, createdAt, updatedAt });
});
