import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { certificates } from '../db/schema';
import { getCurrentUser } from '../lib/auth';
import { getCertificateFile } from '../lib/r2';

export const filesRouter = new Hono<{
  Bindings: {
    DB: D1Database;
    BUCKET: R2Bucket;
  };
}>();

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

  // Fetch object from Cloudflare R2
  const object = await getCertificateFile(c.env.BUCKET, fileKey);
  if (!object || !object.body) {
    return c.text('Object not found in storage', 404);
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

