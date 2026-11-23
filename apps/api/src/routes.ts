import { Router } from 'express';
import { docsRouter } from './docs.js';
import { apiDocsEnabled } from './lib/openapi.js';
import { healthRouter } from './modules/health/health.routes.js';
import { usersRouter } from './modules/users/users.routes.js';

// Every feature's routes are mounted here. app.ts mounts this router at /api,
// so healthRouter answers /api/health and usersRouter answers /api/users.
// To add a feature: create a folder in modules/ and add one line below.
// Then describe its endpoints in a *.docs.ts file and add them in docs.ts.
// To remove a feature: delete its folder, its line below and its line in docs.ts.
export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/users', usersRouter);

// The API docs at /api/docs, only when they're turned on (off in production by default,
// see apiDocsEnabled in lib/openapi.ts).
if (apiDocsEnabled()) {
  apiRouter.use('/docs', docsRouter);
}
