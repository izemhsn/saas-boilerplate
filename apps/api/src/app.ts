import { db, users } from '@saas/db';
import express, { type Request, type Response } from 'express';

// The app is created here but not started, so tests can use it without opening a port.
export const app = express();

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API is running' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/api/users', async (_req: Request, res: Response) => {
  const allUsers = await db.select().from(users);
  res.json(allUsers);
});
