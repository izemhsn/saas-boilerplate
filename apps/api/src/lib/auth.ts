import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import { accounts, db, sessions, users, verifications } from '../db/index.js';
import { apiDocsEnabled } from './openapi.js';

// Better Auth handles sign up, sign in, sign out and sessions for us.
// app.ts mounts its routes at /api/auth/* (for example POST /api/auth/sign-up/email).
//
// BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from process.env by Better Auth itself.
// This file doesn't import env.ts on purpose: tests import the app without a .env,
// and env.ts would stop the process. index.ts still checks both variables at startup.
export const auth = betterAuth({
  // Store users and sessions in Postgres through our Drizzle tables (see src/db/schema.ts).
  // usePlural: our tables are named "users", "sessions"... instead of "user", "session"...
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    schema: { users, sessions, accounts, verifications },
  }),

  // Sign up and sign in with an email and a password.
  emailAndPassword: { enabled: true },

  plugins: [
    // Describes every /api/auth/* endpoint in OpenAPI format, so they show up in our API docs
    // at /api/docs (see src/docs.ts). Better Auth's own docs page is turned off, so all
    // endpoints are listed on that one page instead of two.
    openAPI({ disableDefaultReference: true }),
  ],

  // The openAPI plugin also adds GET /api/auth/open-api/generate-schema, which lists every auth
  // endpoint. Block it when the API docs are off (in production by default, see lib/openapi.ts).
  // docs.ts still builds the docs by calling the plugin directly, which this doesn't block.
  disabledPaths: apiDocsEnabled() ? [] : ['/open-api/generate-schema'],
});
