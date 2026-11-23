import { z } from 'zod';

// Every environment variable the API needs, checked once at startup.
// If one is missing or wrong, the API stops right away with a clear message
// instead of failing later on the first request.
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000), // .env values are text, coerce turns "3000" into 3000
  DATABASE_URL: z.url(),
  // Better Auth reads these two itself (see lib/auth.ts); they're checked here so a missing one
  // stops the API at startup. The secret signs session cookies, so it must be long and random.
  BETTER_AUTH_SECRET: z
    .string({ error: 'Missing. Add it to apps/api/.env, see .env.example' })
    .min(
      32,
      'Empty or too short (at least 32 characters). See apps/api/.env.example to generate one',
    ),
  BETTER_AUTH_URL: z.url(),
  // Turns the API docs at /api/docs on or off (see apiDocsEnabled in lib/openapi.ts, which reads
  // it). Optional: by default they're on while developing and off in production.
  API_DOCS_ENABLED: z.enum(['true', 'false']).optional(),
  // The email server (see lib/email.ts, which reads these). In development that's Mailpit,
  // started with "docker compose up -d mailpit".
  SMTP_HOST: z.string().min(1, 'Missing. Add it to apps/api/.env, see .env.example'),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().optional(), // not needed for Mailpit
  SMTP_PASS: z.string().optional(),
  // Who emails come from, like "Acme <no-reply@acme.com>"
  EMAIL_FROM: z.string().min(1, 'Missing. Add it to apps/api/.env, see .env.example'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment variables:\n' + z.prettifyError(result.error));
  process.exit(1);
}

export const env = result.data;
