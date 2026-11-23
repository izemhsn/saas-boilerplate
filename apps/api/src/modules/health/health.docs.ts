import { z } from 'zod';
import type { ZodOpenApiPathsObject } from 'zod-openapi';

// How the health endpoints appear in the API docs at /api/docs.
// Keep this in sync with health.routes.ts: same paths, same responses.
export const healthDocs: ZodOpenApiPathsObject = {
  '/api/health': {
    get: {
      tags: ['Health'],
      summary: 'Check that the API is up',
      responses: {
        '200': {
          description: 'The API is running',
          content: { 'application/json': { schema: z.object({ status: z.literal('ok') }) } },
        },
      },
    },
  },
};
