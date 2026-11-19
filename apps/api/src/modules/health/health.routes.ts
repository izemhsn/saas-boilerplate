import { Router } from 'express';

// Mounted at /api/health (see routes.ts). Used to check that the API is up.
export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});
