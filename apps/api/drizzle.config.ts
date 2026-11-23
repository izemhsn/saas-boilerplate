import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

// Settings for the drizzle-kit commands (db:generate, db:migrate, db:studio).

// On your machine, read DATABASE_URL from .env (the same file the API uses).
// Skipped when the file doesn't exist (e.g. in Docker, where compose.yaml sets DATABASE_URL).
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to apps/api/.env (see .env.example).');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts', // where the tables are defined
  out: './migrations', // where generated SQL migration files go (commit these)
  dbCredentials: { url: process.env.DATABASE_URL },
});
