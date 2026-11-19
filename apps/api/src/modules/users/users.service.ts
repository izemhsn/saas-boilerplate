import { db, eq, users } from '@saas/db';
import { HttpError } from '../../lib/http-error.js';
import type { CreateUserInput } from './users.schemas.js';

// Business logic and database queries for users.
// No req or res in here: these are plain functions, so routes, jobs or scripts can all use them.

export async function getUserById(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id));

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  return user;
}

export async function createUser(input: CreateUserInput) {
  // Check first so the client gets a clear 409 instead of a generic 500.
  // The unique constraint on email in the database is still the real guarantee.
  const [existing] = await db.select().from(users).where(eq(users.email, input.email));

  if (existing) {
    throw new HttpError(409, 'Email already in use');
  }

  const [user] = await db.insert(users).values(input).returning();
  return user;
}
