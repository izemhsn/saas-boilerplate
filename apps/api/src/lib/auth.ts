import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import { accounts, db, sessions, users, verifications } from '../db/index.js';
import {
  sendExistingAccountEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from './auth-emails.js';
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
  // The emails below are sent without waiting for them (no "await"), on purpose: the request
  // answers right away, and "forgot password" takes the same time whether or not the email
  // has an account, so nobody can use it to find out who has one. Failures are logged.
  emailAndPassword: {
    enabled: true,
    // People must click the link in the verification email before they can sign in
    requireEmailVerification: true,

    // "Forgot password" (POST /api/auth/request-password-reset): email a link to choose a new one
    sendResetPassword: async ({ user, url }) => {
      sendPasswordResetEmail(user.email, url).catch((error) => {
        console.error('Could not send the password reset email:', error);
      });
    },
    resetPasswordTokenExpiresIn: 60 * 60, // 1 hour, as the email says
    // After a reset, sign out every device: if someone else knew the old password, they're out
    revokeSessionsOnPasswordReset: true,

    // Signing up with an email that already has an account looks like it worked (so nobody can
    // find out who has an account), but nothing is created. Tell the real owner by email, so
    // someone who forgot they had an account isn't left waiting for a verification email.
    // The link goes to the web app (BETTER_AUTH_URL); point it at the sign-in page once it exists.
    onExistingUserSignUp: async ({ user }) => {
      sendExistingAccountEmail(user.email, process.env.BETTER_AUTH_URL ?? '/').catch((error) => {
        console.error('Could not send the existing account email:', error);
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      sendVerificationEmail(user.email, url).catch((error) => {
        console.error('Could not send the verification email:', error);
      });
    },
    sendOnSignUp: true,
    // Signing in before verifying sends a new link, in case the first one expired or got lost
    sendOnSignIn: true,
    // Clicking the link also signs the person in
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60, // 1 hour, as the email says
  },

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
