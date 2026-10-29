import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

// One connection pool shared by the whole app.
// It only connects when the first query runs, so importing this file
// without a database (e.g. in tests) doesn't fail.
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle({ client: pool });

// Re-export the tables so apps can write: import { db, users } from '@saas/db'
export * from './schema.js';
