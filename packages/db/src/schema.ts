import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Every table in the database is defined here.
// After changing this file, run "pnpm --filter @saas/db db:generate" to create a migration.

export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(), // 1, 2, 3... set by Postgres
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
