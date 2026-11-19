import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { createUserSchema, userIdParamsSchema } from './users.schemas.js';
import { createUser, getUserById } from './users.service.js';

// Mounted at /api/users (see routes.ts).
// Each handler stays thin: read the request, call the service, send the response.
// No try/catch needed: Express 5 sends errors from async handlers to the error handler.
export const usersRouter = Router();

usersRouter.get('/:id', async (req, res) => {
  const { id } = userIdParamsSchema.parse(req.params);
  const user = await getUserById(id);
  res.json(user);
});

usersRouter.post('/', validate(createUserSchema), async (req, res) => {
  const user = await createUser(req.body);
  res.status(201).json(user);
});
