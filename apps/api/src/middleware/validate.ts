import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';

// Checks req.body against a zod schema before the route runs:
//   router.post('/', validate(createProjectSchema), handler)
// If the body is wrong, parse() throws and the error handler sends a 400.
// If it's right, req.body is replaced with the parsed data (extra fields removed).
// Only the body is checked here: in Express 5 req.query can't be replaced,
// so parse params and query inside the route with schema.parse(req.params).
export function validate(schema: z.ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
}
