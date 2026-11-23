import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

// One connection pool shared by the whole API.
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

// Re-export the tables, so one import gives you both: import { db, users } from '../db/index.js'
// Query helpers (eq, and...) come straight from drizzle-orm: import { eq } from 'drizzle-orm'
export * from './schema.js';
