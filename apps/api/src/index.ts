// env.ts is imported first so the variables are checked before anything else runs.
// It's only imported here (not in app.ts), so tests can use the app without a .env.
import { env } from './env.js';
import { app } from './app.js';

app.listen(env.PORT, () => {
  console.log(`API listening at http://localhost:${env.PORT}`);
});

// Mailpit is a fake inbox: emails sent there never reach anyone. That's right on your machine
// (Docker runs in production mode too), but on a real server it means nobody can verify
// their email or reset their password, so say so.
if (
  process.env.NODE_ENV === 'production' &&
  ['mailpit', 'localhost', '127.0.0.1'].includes(env.SMTP_HOST)
) {
  console.warn(
    `Emails are sent to ${env.SMTP_HOST}, a test inbox, so nobody receives them. ` +
      'On a real server, set SMTP_HOST to your email provider (see the README).',
  );
}
