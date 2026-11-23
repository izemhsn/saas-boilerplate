import { z } from 'zod';
import type { ZodOpenApiPathsObject } from 'zod-openapi';
import { errorSchema } from '../../lib/openapi.js';

// How the users endpoints appear in the API docs at /api/docs.
// Keep this in sync with users.routes.ts: same paths, same responses.

// The signed-in user, as GET /api/users/me sends it (the "users" table in db/schema.ts).
// Dates are sent as text in JSON, so they're strings here.
const currentUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const usersDocs: ZodOpenApiPathsObject = {
  '/api/users/me': {
    get: {
      tags: ['Users'],
      summary: 'Get the signed-in user',
      description:
        'Needs a session cookie. Sign in first with POST /api/auth/sign-in/email; the browser then sends the cookie for you.',
      responses: {
        '200': {
          description: 'The signed-in user',
          content: { 'application/json': { schema: currentUserSchema } },
        },
        '401': {
          description: 'Nobody is signed in, or the session expired',
          content: { 'application/json': { schema: errorSchema } },
        },
      },
    },
  },
};
