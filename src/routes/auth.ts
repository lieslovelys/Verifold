import { Hono } from 'hono';
import { getDb } from '../db';
import { emailLoginSchema, verifyCodeSchema } from '../lib/validation';
import {
  createMagicToken,
  verifyMagicToken,
  destroySession,
  getCurrentUser,
} from '../lib/auth';
import { checkRateLimit } from '../lib/rate-limit';
import { renderAuthPage } from '../views/pages/auth';

export const authRouter = new Hono<{
  Bindings: {
    DB: D1Database;
    ENVIRONMENT: string;
    APP_URL: string;
  };
}>();

authRouter.get('/login', async (c) => {
  const db = getDb(c.env.DB);
  const auth = await getCurrentUser(c, db);
  if (auth) {
    return c.redirect(auth.user.username ? '/dashboard' : '/onboarding');
  }
  return c.html(renderAuthPage());
});

authRouter.get('/signup', async (c) => {
  return c.redirect('/login');
});

// Step 1: Request Magic Link / Code
authRouter.post('/auth/send-magic', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const rate = checkRateLimit(`auth:${ip}`, 6, 60);
  if (!rate.allowed) {
    return c.html(
      renderAuthPage({
        error: `Too many login attempts. Please wait ${rate.resetIn} seconds.`,
      }),
      429
    );
  }

  const body = await c.req.parseBody();
  const parsed = emailLoginSchema.safeParse(body);

  if (!parsed.success) {
    return c.html(
      renderAuthPage({
        error: parsed.error.errors[0]?.message || 'Invalid email address',
      }),
      400
    );
  }

  const email = parsed.data.email;
  const db = getDb(c.env.DB);

  const { rawToken, code } = await createMagicToken(db, email);

  const appUrl = c.env.APP_URL || new URL(c.req.url).origin;
  const magicLink = `${appUrl}/auth/verify?token=${encodeURIComponent(rawToken)}`;

  // In production, an email provider (Resend, Mailchannels, SendGrid) would deliver this.
  // In development, we expose the link and code on screen for instantaneous 1-click testability.
  const isDev = c.env.ENVIRONMENT !== 'production';

  return c.html(
    renderAuthPage({
      email,
      isVerificationStep: true,
      devMagicLink: isDev ? magicLink : undefined,
      devCode: isDev ? code : undefined,
    })
  );
});

// Step 2: Verify 6-digit code
authRouter.post('/auth/verify-code', async (c) => {
  const ip = c.req.header('cf-connecting-ip') || '127.0.0.1';
  const rate = checkRateLimit(`verify:${ip}`, 10, 60);
  if (!rate.allowed) {
    return c.html(
      renderAuthPage({
        error: `Too many attempts. Please wait ${rate.resetIn} seconds.`,
        isVerificationStep: true,
      }),
      429
    );
  }

  const body = await c.req.parseBody();
  const parsed = verifyCodeSchema.safeParse(body);

  if (!parsed.success) {
    return c.html(
      renderAuthPage({
        email: typeof body.email === 'string' ? body.email : '',
        error: 'Please enter a valid 6-digit code',
        isVerificationStep: true,
      }),
      400
    );
  }

  const db = getDb(c.env.DB);
  const user = await verifyMagicToken(c, db, {
    email: parsed.data.email,
    code: parsed.data.code,
  });

  if (!user) {
    return c.html(
      renderAuthPage({
        email: parsed.data.email,
        error: 'Invalid or expired verification code. Please try again.',
        isVerificationStep: true,
      }),
      400
    );
  }

  return c.redirect(user.username ? '/dashboard' : '/onboarding');
});

// Verify via Magic Link Click
authRouter.get('/auth/verify', async (c) => {
  const token = c.req.query('token');
  if (!token) {
    return c.redirect('/login');
  }

  const db = getDb(c.env.DB);
  const user = await verifyMagicToken(c, db, { token });

  if (!user) {
    return c.html(
      renderAuthPage({
        error: 'This magic link has expired or has already been used.',
      }),
      400
    );
  }

  return c.redirect(user.username ? '/dashboard' : '/onboarding');
});

// Logout
authRouter.post('/auth/logout', async (c) => {
  const db = getDb(c.env.DB);
  await destroySession(c, db);
  return c.redirect('/');
});

