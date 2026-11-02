import { Hono } from 'hono';
import { eq, asc, count } from 'drizzle-orm';
import { getDb } from '../db';
import { users, certificates, profileViews, User } from '../db/schema';
import { getCurrentUser, destroySession } from '../lib/auth';
import { onboardingSchema, profileUpdateSchema } from '../lib/validation';
import { deleteAllUserFiles } from '../lib/r2';
import { renderOnboardingPage } from '../views/pages/onboarding';
import { renderDashboardPage } from '../views/pages/dashboard';
import { renderProfileEditPage } from '../views/pages/profile-edit';

export const dashboardRouter = new Hono<{
  Bindings: {
    DB: D1Database;
    BUCKET: R2Bucket;
    ENVIRONMENT: string;
    APP_URL: string;
  };
  Variables: {
    user: User;
  };
}>();

// Auth Guard Middleware for dashboard and onboarding routes
async function authGuard(c: any, next: any) {
  const db = getDb(c.env.DB);
  const auth = await getCurrentUser(c, db);
  if (!auth) {
    return c.redirect('/login');
  }

  // If user has no username and is not already on /onboarding, enforce onboarding
  const path = new URL(c.req.url).pathname;
  if (!auth.user.username && path !== '/onboarding' && path !== '/auth/logout') {
    return c.redirect('/onboarding');
  }

  c.set('user', auth.user);
  await next();
}

dashboardRouter.use('/dashboard', authGuard);
dashboardRouter.use('/dashboard/*', authGuard);
dashboardRouter.use('/onboarding', authGuard);

// Onboarding: Choose username
dashboardRouter.get('/onboarding', async (c) => {
  const user = c.get('user');
  if (user.username) {
    return c.redirect('/dashboard');
  }
  return c.html(
    renderOnboardingPage({
      email: user.email,
      defaultDisplayName: user.displayName || user.email.split('@')[0],
    })
  );
});

dashboardRouter.post('/onboarding', async (c) => {
  const user = c.get('user');
  if (user.username) {
    return c.redirect('/dashboard');
  }

  const body = await c.req.parseBody();
  const parsed = onboardingSchema.safeParse(body);

  if (!parsed.success) {
    return c.html(
      renderOnboardingPage({
        email: user.email,
        defaultDisplayName: typeof body.displayName === 'string' ? body.displayName : '',
        error: parsed.error.errors[0]?.message || 'Invalid username or display name',
      }),
      400
    );
  }

  const { username, displayName } = parsed.data;
  const db = getDb(c.env.DB);

  // Check if username is already claimed
  const existing = await db.select().from(users).where(eq(users.username, username.toLowerCase())).limit(1);
  if (existing.length > 0 && existing[0].id !== user.id) {
    return c.html(
      renderOnboardingPage({
        email: user.email,
        defaultDisplayName: displayName,
        error: `The username "${username}" is already taken. Please choose another one.`,
      }),
      400
    );
  }

  // Save username and display name
  await db
    .update(users)
    .set({
      username: username.toLowerCase(),
      displayName,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return c.redirect('/dashboard');
});

// Dashboard Home
dashboardRouter.get('/dashboard', async (c) => {
  const user = c.get('user');
  const db = getDb(c.env.DB);

  // Fetch all user's certificates ordered by sortOrder
  const userCerts = await db
    .select()
    .from(certificates)
    .where(eq(certificates.userId, user.id))
    .orderBy(asc(certificates.sortOrder), asc(certificates.createdAt));

  // Fetch total profile views
  const viewsResult = await db
    .select({ count: count() })
    .from(profileViews)
    .where(eq(profileViews.userId, user.id));

  const viewsCount = viewsResult[0]?.count || 0;

  return c.html(
    renderDashboardPage({
      user,
      certificates: userCerts,
      viewsCount,
    })
  );
});

// Profile Settings Page
dashboardRouter.get('/dashboard/profile', async (c) => {
  const user = c.get('user');
  return c.html(renderProfileEditPage({ user }));
});

// Update Profile Settings
dashboardRouter.post('/dashboard/profile', async (c) => {
  const user = c.get('user');
  const body = await c.req.parseBody();
  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return c.html(
      renderProfileEditPage({
        user,
        error: parsed.error.errors[0]?.message || 'Invalid profile settings',
      }),
      400
    );
  }

  const db = getDb(c.env.DB);
  await db
    .update(users)
    .set({
      displayName: parsed.data.displayName,
      bio: parsed.data.bio || '',
      accentColor: parsed.data.accentColor,
      theme: parsed.data.theme,
      layout: parsed.data.layout,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  const updatedUser = { ...user, ...parsed.data, bio: parsed.data.bio || '' };
  return c.html(
    renderProfileEditPage({
      user: updatedUser,
      success: 'Profile settings updated successfully!',
    })
  );
});

// Delete Entire Account (Removes all DB records and R2 files)
dashboardRouter.post('/dashboard/account/delete', async (c) => {
  const user = c.get('user');
  const db = getDb(c.env.DB);

  // 1. Delete all user certificate files from R2
  try {
    await deleteAllUserFiles(c.env.BUCKET, user.id);
  } catch (err) {
    console.error('Failed to cleanup R2 files on account deletion:', err);
  }

  // 2. Delete user from D1 (Cascades to certificates, sessions, views, tokens)
  await db.delete(users).where(eq(users.id, user.id));

  // 3. Clear session cookie
  await destroySession(c, db);

  return c.redirect('/');
});
