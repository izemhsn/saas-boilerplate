import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

// Settings for the drizzle-kit commands (db:generate, db:migrate, db:studio).

// On your machine, read DATABASE_URL from the API's .env so it lives in one place.
// Skipped when the file doesn't exist (e.g. in Docker, where compose.yaml sets DATABASE_URL).
const envFile = '../../apps/api/.env';
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it to apps/api/.env (see .env.example).');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts', // where the tables are defined
  out: './migrations', // where generated SQL migration files go (commit these)
  dbCredentials: { url: process.env.DATABASE_URL },
});
