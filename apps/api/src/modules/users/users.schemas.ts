import { z } from 'zod';

// The shape of the data each users route accepts.

// POST /api/users body
export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(1).optional(),
});

// The :id in /api/users/:id. URL params are text, coerce turns "42" into 42.
export const userIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// The type TypeScript gets from the schema, so the service and the schema never drift apart.
export type CreateUserInput = z.infer<typeof createUserSchema>;
