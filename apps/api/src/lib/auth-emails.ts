import { escapeHtml, sendEmail } from './email.js';

// The emails Better Auth asks us to send (see lib/auth.ts). Edit the wording here.
// Each one has a plain-text version and a simple HTML version with a button.
// The user's name isn't used on purpose: it's whatever they typed at sign-up.

export async function sendVerificationEmail(to: string, url: string) {
  await sendEmail({
    to,
    subject: 'Verify your email address',
    text: [
      'Confirm your email address by opening this link:',
      url,
      "The link works for 1 hour. If you didn't create an account, you can ignore this email.",
    ].join('\n\n'),
    html: buttonEmailHtml({
      intro: 'Confirm your email address by clicking the button below.',
      buttonText: 'Verify email',
      url,
      outro:
        "The link works for 1 hour. If you didn't create an account, you can ignore this email.",
    }),
  });
}

export async function sendPasswordResetEmail(to: string, url: string) {
  await sendEmail({
    to,
    subject: 'Reset your password',
    text: [
      'Choose a new password by opening this link:',
      url,
      "The link works for 1 hour. If you didn't ask to reset your password, you can ignore this email: your password stays the same.",
    ].join('\n\n'),
    html: buttonEmailHtml({
      intro: 'Choose a new password by clicking the button below.',
      buttonText: 'Reset password',
      url,
      outro:
        "The link works for 1 hour. If you didn't ask to reset your password, you can ignore this email: your password stays the same.",
    }),
  });
}

// Someone tried to sign up with an email that already has an account. Better Auth answers them
// as if it worked (so nobody can find out which emails have accounts), and we tell the real owner.
// Signing in also covers people who never verified: it sends them a new verification link.
export async function sendExistingAccountEmail(to: string, appUrl: string) {
  const intro =
    'Someone, probably you, tried to create an account with this email address, but you already have one.';
  const outro =
    'Forgot your password? Use "Forgot password" when you sign in. If this wasn\'t you, you can ignore this email: nothing changed on your account.';
  await sendEmail({
    to,
    subject: 'You already have an account',
    text: [intro, `Sign in here: ${appUrl}`, outro].join('\n\n'),
    html: buttonEmailHtml({ intro, buttonText: 'Sign in', url: appUrl, outro }),
  });
}

// A short email with one button. The link is also shown as text, for email apps that block buttons.
// word-break lets the long link wrap instead of making the email scroll sideways on phones.
function buttonEmailHtml(email: { intro: string; buttonText: string; url: string; outro: string }) {
  const url = escapeHtml(email.url);
  return `<p>${email.intro}</p>
<p><a href="${url}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px">${email.buttonText}</a></p>
<p style="word-break:break-all">Or copy this link into your browser:<br>${url}</p>
<p style="color:#666">${email.outro}</p>`;
}
