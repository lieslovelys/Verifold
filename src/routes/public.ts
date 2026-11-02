import { Hono } from 'hono';
import { eq, and, asc } from 'drizzle-orm';
import { getDb } from '../db';
import { users, certificates, profileViews } from '../db/schema';
import { getCurrentUser } from '../lib/auth';
import { RESERVED_USERNAMES } from '../lib/validation';
import { renderLandingPage } from '../views/pages/landing';
import { renderPortfolioPage } from '../views/pages/portfolio';
import { renderNotFoundPage } from '../views/pages/not-found';
import { escapeHtml } from '../lib/sanitize';

export const publicRouter = new Hono<{
  Bindings: {
    DB: D1Database;
    ENVIRONMENT: string;
    APP_URL: string;
  };
}>();

// Landing Page
publicRouter.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const auth = await getCurrentUser(c, db);

  const html = renderLandingPage(auth ? auth.user : null);
  c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  return c.html(html);
});

// Dynamic SVG OpenGraph Image for /{username}
publicRouter.get('/og-image/:username', async (c) => {
  const rawUsername = c.req.param('username').toLowerCase();
  const db = getDb(c.env.DB);

  const targetUsers = await db.select().from(users).where(eq(users.username, rawUsername)).limit(1);
  if (targetUsers.length === 0) {
    return c.text('Not found', 404);
  }

  const u = targetUsers[0];
  const accent = u.accentColor || '#2563eb';
  const name = escapeHtml(u.displayName || u.username || 'User');
  const handle = escapeHtml(u.username || '');
  const bio = escapeHtml(u.bio ? u.bio.slice(0, 100) + (u.bio.length > 100 ? '...' : '') : 'Verified Professional Portfolio');

  // SVG dimensions: 1200x630 (standard OG image size)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <linearGradient id="accentGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.3" />
        <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
      </linearGradient>
    </defs>
    
    <rect width="1200" height="630" fill="url(#bg)" />
    <circle cx="1050" cy="150" r="400" fill="url(#accentGlow)" filter="blur(80px)" />
    
    <!-- Outer Card Border -->
    <rect x="50" y="50" width="1100" height="530" rx="32" fill="none" stroke="#1e293b" stroke-width="2" />
    
    <!-- Brand Tag -->
    <g transform="translate(100, 110)">
      <rect width="140" height="38" rx="19" fill="#1e293b" />
      <text x="70" y="24" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="14" font-weight="700" text-anchor="middle">📜 CERTFOLIO</text>
    </g>

    <!-- Name & Handle -->
    <text x="100" y="240" fill="#ffffff" font-family="system-ui, sans-serif" font-size="56" font-weight="800">${name}</text>
    <text x="100" y="295" fill="${accent}" font-family="system-ui, sans-serif" font-size="28" font-weight="700">@${handle}</text>

    <!-- Bio -->
    <text x="100" y="370" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="24" font-weight="400">${bio}</text>

    <!-- Badge -->
    <g transform="translate(100, 470)">
      <rect width="220" height="46" rx="23" fill="${accent}" />
      <text x="110" y="29" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="700" text-anchor="middle">✓ Verified Credentials</text>
    </g>
  </svg>`;

  c.header('Content-Type', 'image/svg+xml');
  c.header('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  return c.body(svg);
});

// Public Profile Page: /{username}
publicRouter.get('/:username', async (c) => {
  const username = c.req.param('username').toLowerCase();

  // Block reserved route paths
  if (RESERVED_USERNAMES.has(username)) {
    return c.html(renderNotFoundPage('Reserved Page', `The path "/${username}" is a reserved system route.`), 404);
  }

  const db = getDb(c.env.DB);
  const targetUsers = await db.select().from(users).where(eq(users.username, username)).limit(1);

  if (targetUsers.length === 0) {
    return c.html(
      renderNotFoundPage(
        'Portfolio Not Found',
        `The portfolio "/${username}" does not exist yet. If this is your name, you can claim it now!`
      ),
      404
    );
  }

  const profileUser = targetUsers[0];
  const auth = await getCurrentUser(c, db);
  const isOwner = auth ? auth.user.id === profileUser.id : false;

  // Track profile view count (only when viewed by external visitors, not the owner)
  if (!isOwner) {
    try {
      await db.insert(profileViews).values({
        id: crypto.randomUUID(),
        userId: profileUser.id,
        viewedAt: new Date(),
      });
    } catch (e) {
      // Fire-and-forget; don't fail page load on view recording
      console.warn('Failed to record view:', e);
    }
  }

  // Fetch certificates: owners see all certs, visitors see only public certs
  const certs = await db
    .select()
    .from(certificates)
    .where(
      isOwner
        ? eq(certificates.userId, profileUser.id)
        : and(eq(certificates.userId, profileUser.id), eq(certificates.isPublic, 1))
    )
    .orderBy(asc(certificates.sortOrder), asc(certificates.createdAt));

  const appUrl = c.env.APP_URL || new URL(c.req.url).origin;
  const html = renderPortfolioPage({
    user: profileUser,
    certificates: certs,
    isOwner,
    currentUser: auth ? auth.user : null,
    appUrl,
  });

  if (!isOwner) {
    c.header('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  } else {
    c.header('Cache-Control', 'private, no-cache');
  }

  return c.html(html);
});

