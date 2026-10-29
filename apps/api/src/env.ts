import { z } from 'zod';

// Every environment variable the API needs, checked once at startup.
// If one is missing or wrong, the API stops right away with a clear message
// instead of failing later on the first request.
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000), // .env values are text, coerce turns "3000" into 3000
  DATABASE_URL: z.url(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment variables:\n' + z.prettifyError(result.error));
  process.exit(1);
}

export const env = result.data;
