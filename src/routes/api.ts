import { Hono } from 'hono';
import { eq, and, count, max } from 'drizzle-orm';
import { getDb } from '../db';
import { certificates, User } from '../db/schema';
import { getCurrentUser } from '../lib/auth';
import {
  certificateCreateSchema,
  certificateUpdateSchema,
  reorderSchema,
} from '../lib/validation';
import { validateFileBuffer, AllowedFileType } from '../lib/file-type';
import { uploadCertificateFile, deleteCertificateFile } from '../lib/r2';
import { checkRateLimit } from '../lib/rate-limit';

export const apiRouter = new Hono<{
  Bindings: {
    DB: D1Database;
    BUCKET?: R2Bucket;
    ENVIRONMENT: string;
  };
  Variables: {
    user: User;
  };
}>();

// Auth Middleware for API
apiRouter.use('/api/*', async (c, next) => {
  const db = getDb(c.env.DB);
  const auth = await getCurrentUser(c, db);
  if (!auth) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('user', auth.user);
  await next();
});

// Add New Certificate
apiRouter.post('/api/certificates', async (c) => {
  const user = c.get('user');
  const db = getDb(c.env.DB);

  // Rate limiting on uploads
  const rate = checkRateLimit(`upload:${user.id}`, 20, 60);
  if (!rate.allowed) {
    return c.json({ error: `Upload rate limit reached. Please wait ${rate.resetIn}s.` }, 429);
  }

  // Enforce Max 30 certificates per user limit
  const countResult = await db
    .select({ count: count() })
    .from(certificates)
    .where(eq(certificates.userId, user.id));
  const currentTotal = countResult[0]?.count || 0;

  if (currentTotal >= 30) {
    return c.json(
      { error: 'Maximum limit of 30 certificates reached for your account.' },
      400
    );
  }

  const formData = await c.req.parseBody();

  // Validate form fields
  const parsed = certificateCreateSchema.safeParse({
    title: formData.title,
    issuer: formData.issuer,
    issuedAt: formData.issuedAt,
    category: formData.category || 'General',
    description: formData.description || '',
    verifyUrl: formData.verifyUrl || '',
    isPublic: formData.isPublic !== undefined ? Number(formData.isPublic) : 1,
  });

  if (!parsed.success) {
    return c.json({ error: parsed.error.errors[0]?.message || 'Validation error' }, 400);
  }

  // Validate file
  const file = formData.file;
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'Please choose a valid certificate file (PNG, JPG, WEBP, or PDF)' }, 400);
  }

  const buffer = await file.arrayBuffer();
  const fileCheck = validateFileBuffer(buffer);
  if (!fileCheck.valid || !fileCheck.contentType || !fileCheck.extension) {
    return c.json({ error: fileCheck.error || 'Invalid file format' }, 400);
  }

  // Upload to Cloudflare R2 / D1
  const { fileKey, fileSize } = await uploadCertificateFile(
    c.env.BUCKET,
    user.id,
    buffer,
    fileCheck.contentType as AllowedFileType,
    fileCheck.extension,
    c.env.DB
  );

  // Determine next sortOrder
  const maxOrderResult = await db
    .select({ maxOrder: max(certificates.sortOrder) })
    .from(certificates)
    .where(eq(certificates.userId, user.id));
  const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

  const certId = crypto.randomUUID();
  const newCert = {
    id: certId,
    userId: user.id,
    title: parsed.data.title,
    issuer: parsed.data.issuer,
    issuedAt: parsed.data.issuedAt,
    category: parsed.data.category || 'General',
    description: parsed.data.description || '',
    fileKey,
    fileType: fileCheck.contentType,
    fileName: file.name,
    fileSize,
    verifyUrl: parsed.data.verifyUrl || null,
    sortOrder: nextOrder,
    isPublic: parsed.data.isPublic,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(certificates).values(newCert);

  return c.json({ success: true, certificate: newCert }, 201);
});

// Update Existing Certificate
apiRouter.post('/api/certificates/:id', async (c) => {
  const user = c.get('user');
  const certId = c.req.param('id');
  const db = getDb(c.env.DB);

  // Verify ownership
  const existing = await db
    .select()
    .from(certificates)
    .where(and(eq(certificates.id, certId), eq(certificates.userId, user.id)))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: 'Certificate not found or unauthorized' }, 404);
  }

  const cert = existing[0];
  const formData = await c.req.parseBody();

  const parsed = certificateUpdateSchema.safeParse({
    title: formData.title,
    issuer: formData.issuer,
    issuedAt: formData.issuedAt,
    category: formData.category,
    description: formData.description,
    verifyUrl: formData.verifyUrl,
    isPublic: formData.isPublic !== undefined ? Number(formData.isPublic) : undefined,
  });

  if (!parsed.success) {
    return c.json({ error: parsed.error.errors[0]?.message || 'Validation error' }, 400);
  }

  const updates: Record<string, any> = {
    updatedAt: new Date(),
    ...parsed.data,
  };

  // If a new replacement file is uploaded
  const file = formData.file;
  if (file && file instanceof File && file.size > 0) {
    const buffer = await file.arrayBuffer();
    const fileCheck = validateFileBuffer(buffer);
    if (!fileCheck.valid || !fileCheck.contentType || !fileCheck.extension) {
      return c.json({ error: fileCheck.error || 'Invalid file format' }, 400);
    }

    // Delete old file from storage
    try {
      await deleteCertificateFile(c.env.BUCKET, cert.fileKey, c.env.DB);
    } catch (e) {
      console.warn('Failed to delete old file from storage:', e);
    }

    // Upload new file to storage
    const { fileKey, fileSize } = await uploadCertificateFile(
      c.env.BUCKET,
      user.id,
      buffer,
      fileCheck.contentType as AllowedFileType,
      fileCheck.extension,
      c.env.DB
    );

    updates.fileKey = fileKey;
    updates.fileType = fileCheck.contentType;
    updates.fileName = file.name;
    updates.fileSize = fileSize;
  }

  await db.update(certificates).set(updates).where(eq(certificates.id, certId));

  return c.json({ success: true });
});

// Delete Certificate
apiRouter.delete('/api/certificates/:id', async (c) => {
  const user = c.get('user');
  const certId = c.req.param('id');
  const db = getDb(c.env.DB);

  // Verify ownership
  const existing = await db
    .select()
    .from(certificates)
    .where(and(eq(certificates.id, certId), eq(certificates.userId, user.id)))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: 'Certificate not found' }, 404);
  }

  const cert = existing[0];

  // Delete file from storage
  try {
    await deleteCertificateFile(c.env.BUCKET, cert.fileKey, c.env.DB);
  } catch (e) {
    console.warn('Failed to delete file from storage:', e);
  }

  // Delete row from D1
  await db.delete(certificates).where(eq(certificates.id, certId));

  return c.json({ success: true });
});

// Toggle Public/Private Visibility
apiRouter.post('/api/certificates/:id/toggle-visibility', async (c) => {
  const user = c.get('user');
  const certId = c.req.param('id');
  const db = getDb(c.env.DB);

  const existing = await db
    .select()
    .from(certificates)
    .where(and(eq(certificates.id, certId), eq(certificates.userId, user.id)))
    .limit(1);

  if (existing.length === 0) {
    return c.json({ error: 'Certificate not found' }, 404);
  }

  const current = existing[0];
  const newStatus = current.isPublic === 1 ? 0 : 1;

  await db
    .update(certificates)
    .set({ isPublic: newStatus, updatedAt: new Date() })
    .where(eq(certificates.id, certId));

  return c.json({ success: true, isPublic: newStatus === 1 });
});

// Reorder Certificates
apiRouter.post('/api/certificates/reorder', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = reorderSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: 'Invalid order list' }, 400);
  }

  const db = getDb(c.env.DB);

  // Update sortOrder for each certificate belonging to the user
  const promises = parsed.data.order.map((certId, index) =>
    db
      .update(certificates)
      .set({ sortOrder: index })
      .where(and(eq(certificates.id, certId), eq(certificates.userId, user.id)))
  );

  await Promise.all(promises);

  return c.json({ success: true });
});
