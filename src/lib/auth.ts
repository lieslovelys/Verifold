import { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { eq, and, gt } from 'drizzle-orm';
import { Database } from '../db';
import { users, sessions, magicTokens, User } from '../db/schema';

export const SESSION_COOKIE_NAME = 'certfolio_session';
export const SESSION_DURATION_DAYS = 30;
export const MAGIC_TOKEN_DURATION_MINUTES = 15;

/**
 * Edge-compatible SHA-256 hex hasher using Web Crypto API.
 */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate cryptographically secure random hex string.
 */
export function generateRandomToken(bytes = 32): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a 6-digit verification code.
 */
export function generate6DigitCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const code = (array[0] % 900000) + 100000;
  return code.toString();
}

/**
 * Creates an active session in D1 and sets the session cookie on the Hono response.
 */
export async function createSession(
  c: Context,
  db: Database,
  userId: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateRandomToken(32);
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
  const sessionId = crypto.randomUUID();

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    tokenHash,
    expiresAt,
    createdAt: new Date(),
  });

  const isProduction = c.env.ENVIRONMENT === 'production';
  setCookie(c, SESSION_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Lax',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
  });

  return { token, expiresAt };
}

/**
 * Retrieves the currently authenticated user from the request session cookie.
 */
export async function getCurrentUser(
  c: Context,
  db: Database
): Promise<{ user: User; sessionId: string } | null> {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) return null;

  const tokenHash = await sha256(token);
  const now = new Date();

  const result = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  if (!result || result.length === 0) {
    deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
    return null;
  }

  return {
    user: result[0].user,
    sessionId: result[0].session.id,
  };
}

/**
 * Destroys the current session in D1 and clears the session cookie.
 */
export async function destroySession(c: Context, db: Database): Promise<void> {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (token) {
    const tokenHash = await sha256(token);
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }
  deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
}

/**
 * Creates a magic link and 6-digit code in D1 for authentication.
 */
export async function createMagicToken(
  db: Database,
  email: string
): Promise<{ rawToken: string; code: string; expiresAt: Date }> {
  const rawToken = generateRandomToken(32);
  const tokenHash = await sha256(rawToken);
  const code = generate6DigitCode();
  const expiresAt = new Date(Date.now() + MAGIC_TOKEN_DURATION_MINUTES * 60 * 1000);

  // Clean up existing tokens for this email
  await db.delete(magicTokens).where(eq(magicTokens.email, email));

  await db.insert(magicTokens).values({
    id: crypto.randomUUID(),
    email,
    tokenHash,
    code,
    expiresAt,
    createdAt: new Date(),
  });

  return { rawToken, code, expiresAt };
}

/**
 * Verifies a magic token by rawToken or 6-digit code, returning the authenticated user.
 */
export async function verifyMagicToken(
  c: Context,
  db: Database,
  query: { token?: string; email?: string; code?: string }
): Promise<User | null> {
  const now = new Date();
  let email: string | null = null;

  if (query.token) {
    const tokenHash = await sha256(query.token);
    const records = await db
      .select()
      .from(magicTokens)
      .where(and(eq(magicTokens.tokenHash, tokenHash), gt(magicTokens.expiresAt, now)))
      .limit(1);

    if (records.length > 0) {
      email = records[0].email;
      await db.delete(magicTokens).where(eq(magicTokens.id, records[0].id));
    }
  } else if (query.email && query.code) {
    const records = await db
      .select()
      .from(magicTokens)
      .where(
        and(
          eq(magicTokens.email, query.email.toLowerCase()),
          eq(magicTokens.code, query.code.trim()),
          gt(magicTokens.expiresAt, now)
        )
      )
      .limit(1);

    if (records.length > 0) {
      email = records[0].email;
      await db.delete(magicTokens).where(eq(magicTokens.id, records[0].id));
    }
  }

  if (!email) return null;

  // Find or create user
  const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);

  let user: User;
  if (existingUsers.length > 0) {
    user = existingUsers[0];
  } else {
    const newUser = {
      id: crypto.randomUUID(),
      email,
      username: null, // picked in onboarding
      displayName: email.split('@')[0],
      bio: '',
      accentColor: '#2563eb',
      theme: 'system',
      layout: 'grid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(users).values(newUser);
    user = newUser as User;
  }

  // Create session
  await createSession(c, db, user.id);
  return user;
}

