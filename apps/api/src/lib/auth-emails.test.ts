import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  sendExistingAccountEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from './auth-emails.js';
import { sendEmail } from './email.js';

// Replace sendEmail with a fake that records what it was asked to send, so the tests need no
// email server. escapeHtml stays real.
vi.mock('./email.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./email.js')>()),
  sendEmail: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
});

// What sendEmail received the last time it was called
function lastEmail() {
  return vi.mocked(sendEmail).mock.lastCall![0];
}

describe.each([
  {
    name: 'sendVerificationEmail',
    send: sendVerificationEmail,
    subject: 'Verify your email address',
  },
  { name: 'sendPasswordResetEmail', send: sendPasswordResetEmail, subject: 'Reset your password' },
  {
    name: 'sendExistingAccountEmail',
    send: sendExistingAccountEmail,
    subject: 'You already have an account',
  },
])('$name', ({ send, subject }) => {
  it('sends the link to the given address', async () => {
    await send('ada@example.com', 'http://localhost:5173/api/auth/some-link?token=abc');

    expect(lastEmail()).toMatchObject({ to: 'ada@example.com', subject });
    expect(lastEmail().text).toContain('http://localhost:5173/api/auth/some-link?token=abc');
    expect(lastEmail().html).toContain('href="http://localhost:5173/api/auth/some-link?token=abc"');
  });

  it('escapes the link in the HTML, so it cannot add its own tags', async () => {
    await send('ada@example.com', 'http://localhost/x?a=1&b="><script>alert(1)</script>');

    expect(lastEmail().html).not.toContain('<script>');
    expect(lastEmail().html).toContain('a=1&amp;b=&quot;&gt;&lt;script&gt;');
  });

  it('lets the long link wrap, so the email does not scroll sideways', async () => {
    await send('ada@example.com', 'http://localhost:5173/api/auth/some-link?token=abc');

    expect(lastEmail().html).toContain('<p style="word-break:break-all">Or copy this link');
  });
});
