// env.ts is imported first so the variables are checked before anything else runs.
// It's only imported here (not in app.ts), so tests can use the app without a .env.
import { env } from './env.js';
import { app } from './app.js';

app.listen(env.PORT, () => {
  console.log(`API listening at http://localhost:${env.PORT}`);
});
