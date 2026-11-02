import { AllowedFileType } from './file-type';

export interface UploadResult {
  fileKey: string;
  fileSize: number;
}

/**
 * Encodes an ArrayBuffer to a Base64 string safely across Cloudflare edge runtime.
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a Base64 string to a Uint8Array.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Saves a validated certificate file to Cloudflare R2 storage or D1 fallback.
 * Files are partitioned by userId to guarantee isolation:
 * `certs/${userId}/${uniqueId}.${extension}`
 */
export async function uploadCertificateFile(
  bucket: R2Bucket | undefined,
  userId: string,
  buffer: ArrayBuffer,
  contentType: AllowedFileType,
  extension: string,
  d1?: D1Database
): Promise<UploadResult> {
  const uniqueId = crypto.randomUUID();
  const fileKey = `certs/${userId}/${uniqueId}.${extension}`;

  if (bucket) {
    await bucket.put(fileKey, buffer, {
      httpMetadata: {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
      },
      customMetadata: {
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
      },
    });
  } else if (d1) {
    const base64 = bufferToBase64(buffer);
    await d1
      .prepare(
        'INSERT OR REPLACE INTO certificate_files (file_key, data, mime_type, file_size, created_at) VALUES (?, ?, ?, ?, ?)'
      )
      .bind(fileKey, base64, contentType, buffer.byteLength, Math.floor(Date.now() / 1000))
      .run();
  }

  return {
    fileKey,
    fileSize: buffer.byteLength,
  };
}

/**
 * Retrieves a file object from Cloudflare R2 storage or D1 fallback.
 */
export async function getCertificateFile(
  bucket: R2Bucket | undefined,
  fileKey: string,
  d1?: D1Database
): Promise<{
  body: ReadableStream | null;
  httpEtag: string;
  httpMetadata?: { contentType?: string };
  writeHttpMetadata: (headers: Headers) => void;
} | null> {
  if (bucket) {
    const object = await bucket.get(fileKey);
    if (object && object.body) {
      return object;
    }
  }

  if (d1) {
    const row = await d1
      .prepare('SELECT data, mime_type, file_size FROM certificate_files WHERE file_key = ?')
      .bind(fileKey)
      .first<{ data: string; mime_type: string; file_size: number }>();

    if (row && row.data) {
      const bytes = base64ToUint8Array(row.data);
      const stream = new Response(bytes).body;
      return {
        body: stream,
        httpEtag: `W/"${fileKey}"`,
        httpMetadata: { contentType: row.mime_type },
        writeHttpMetadata(headers: Headers) {
          headers.set('Content-Type', row.mime_type);
        },
      };
    }
  }

  return null;
}

/**
 * Deletes a file from Cloudflare R2 storage and/or D1 fallback.
 */
export async function deleteCertificateFile(
  bucket: R2Bucket | undefined,
  fileKey: string,
  d1?: D1Database
): Promise<void> {
  if (bucket) {
    await bucket.delete(fileKey);
  }
  if (d1) {
    await d1.prepare('DELETE FROM certificate_files WHERE file_key = ?').bind(fileKey).run();
  }
}

/**
 * Deletes all files for a user in Cloudflare R2 or D1 (used during full account deletion).
 */
export async function deleteAllUserFiles(
  bucket: R2Bucket | undefined,
  userId: string,
  d1?: D1Database
): Promise<void> {
  if (bucket) {
    const prefix = `certs/${userId}/`;
    let truncated = true;
    let cursor: string | undefined = undefined;

    while (truncated) {
      const listResult = await bucket.list({ prefix, cursor });
      if (listResult.objects.length > 0) {
        const keys = listResult.objects.map((obj) => obj.key);
        await bucket.delete(keys);
      }
      truncated = listResult.truncated;
      cursor = listResult.truncated ? listResult.cursor : undefined;
    }
  }

  if (d1) {
    await d1
      .prepare('DELETE FROM certificate_files WHERE file_key LIKE ?')
      .bind(`certs/${userId}/%`)
      .run();
  }
}
