import { Router } from 'express';
import { healthRouter } from './modules/health/health.routes.js';
import { usersRouter } from './modules/users/users.routes.js';

// Every feature's routes are mounted here. app.ts mounts this router at /api,
// so healthRouter answers /api/health and usersRouter answers /api/users.
// To add a feature: create a folder in modules/ and add one line below.
export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/users', usersRouter);
