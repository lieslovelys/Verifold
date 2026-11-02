import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { certificates } from '../db/schema';
import { getCurrentUser } from '../lib/auth';
import { getCertificateFile } from '../lib/r2';

export const filesRouter = new Hono<{
  Bindings: {
    DB: D1Database;
    BUCKET?: R2Bucket;
  };
}>();

function renderFallbackCertificateSvg(title: string, issuer: string, date: string, category: string): string {
  const esc = (s: string) =>
    (s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#141c2e" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  <rect x="24" y="24" width="752" height="452" rx="16" fill="none" stroke="#1e293b" stroke-width="2" />
  <rect x="36" y="36" width="728" height="428" rx="12" fill="none" stroke="#2563eb" stroke-opacity="0.25" stroke-width="1" />
  <circle cx="400" cy="110" r="32" fill="#0f172a" stroke="url(#gold)" stroke-width="2" />
  <path d="M392 110l6 6 12-12" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  <text x="400" y="180" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" letter-spacing="3">${esc(category || 'GENERAL').toUpperCase()} CREDENTIAL</text>
  <text x="400" y="235" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="22" font-weight="700" fill="#f8fafc">${esc(title)}</text>
  <text x="400" y="275" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="15" font-weight="500" fill="#38bdf8">${esc(issuer)}</text>
  <line x1="260" y1="320" x2="540" y2="320" stroke="#334155" stroke-width="1" />
  <text x="400" y="360" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="13" fill="#64748b">Issued: ${esc(date)}</text>
  <text x="400" y="415" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="600" fill="#475569" letter-spacing="2">VERIFOLD AUTHENTICATED CERTIFICATE</text>
</svg>`;
}

filesRouter.get('/file/:key{.*}', async (c) => {
  const rawKey = c.req.param('key');
  const fileKey = decodeURIComponent(rawKey);

  if (!fileKey) {
    return c.text('File key required', 400);
  }

  const db = getDb(c.env.DB);

  // Look up certificate ownership and visibility in D1
  const records = await db
    .select()
    .from(certificates)
    .where(eq(certificates.fileKey, fileKey))
    .limit(1);

  if (records.length === 0) {
    return c.text('Certificate file not found', 404);
  }

  const cert = records[0];

  // If private, only the owner may access the file
  if (cert.isPublic === 0) {
    const auth = await getCurrentUser(c, db);
    if (!auth || auth.user.id !== cert.userId) {
      return c.text('403 Forbidden: This certificate is marked private by the owner.', 403);
    }
  }

  // Fetch object from Cloudflare R2 or D1 storage
  const object = await getCertificateFile(c.env.BUCKET, fileKey, c.env.DB);
  if (!object || !object.body) {
    // If not found in binary storage (e.g. initial seed records), serve crisp verified SVG representation
    const svg = renderFallbackCertificateSvg(
      cert.title,
      cert.issuer,
      cert.issuedAt,
      cert.category || 'General'
    );
    const headers = new Headers();
    headers.set('Content-Type', 'image/svg+xml; charset=utf-8');
    if (cert.isPublic === 1) {
      headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    } else {
      headers.set('Cache-Control', 'private, no-cache, no-store');
    }
    return new Response(svg, { headers });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Content-Type', cert.fileType || object.httpMetadata?.contentType || 'application/octet-stream');

  // Cache headers: public files are immutable in edge cache; private files are never shared
  if (cert.isPublic === 1) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    headers.set('Cache-Control', 'private, no-cache, no-store');
  }

  return new Response(object.body, { headers });
});
