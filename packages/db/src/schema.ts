import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Every table in the database is defined here.
// After changing this file, run "pnpm --filter @saas/db db:generate" to create a migration.

export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(), // 1, 2, 3... set by Postgres
  email: text('email').notNull().unique(),
  name: text('name'),
  // withTimezone stores an exact moment in time ("timestamptz"), so dates don't shift
  // if the server's timezone changes. Use it for every timestamp column.
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
