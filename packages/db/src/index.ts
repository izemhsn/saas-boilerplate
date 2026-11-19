import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

// One connection pool shared by the whole app.
// It only connects when the first query runs, so importing this file
// without a database (e.g. in tests) doesn't fail.
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// If an idle connection breaks (for example, Postgres restarts), the pool emits an "error" event.
// Without this listener Node would crash the whole API. The pool opens a new connection
// for the next query, so logging the error is enough.
pool.on('error', (err) => {
  console.error('Idle database connection failed:', err);
});

export const db = drizzle({ client: pool });

// Re-export the tables so apps can write: import { db, users } from '@saas/db'
export * from './schema.js';

// Re-export the query helpers too, so apps use the same drizzle-orm copy as this package
// and don't need their own drizzle-orm dependency: import { db, eq, users } from '@saas/db'
export { and, asc, desc, eq, or, sql } from 'drizzle-orm';
