import { AllowedFileType } from './file-type';

export interface UploadResult {
  fileKey: string;
  fileSize: number;
}

/**
 * Saves a validated certificate file to Cloudflare R2 storage.
 * Files are partitioned by userId to guarantee isolation:
 * `certificates/${userId}/${uniqueId}.${extension}`
 */
export async function uploadCertificateFile(
  bucket: R2Bucket,
  userId: string,
  buffer: ArrayBuffer,
  contentType: AllowedFileType,
  extension: string
): Promise<UploadResult> {
  const uniqueId = crypto.randomUUID();
  const fileKey = `certs/${userId}/${uniqueId}.${extension}`;

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

  return {
    fileKey,
    fileSize: buffer.byteLength,
  };
}

/**
 * Retrieves a file object from Cloudflare R2 storage.
 */
export async function getCertificateFile(
  bucket: R2Bucket,
  fileKey: string
): Promise<R2ObjectBody | null> {
  const object = await bucket.get(fileKey);
  return object;
}

/**
 * Deletes a file from Cloudflare R2 storage.
 */
export async function deleteCertificateFile(
  bucket: R2Bucket,
  fileKey: string
): Promise<void> {
  await bucket.delete(fileKey);
}

/**
 * Deletes all files for a user in Cloudflare R2 (used during full account deletion).
 */
export async function deleteAllUserFiles(
  bucket: R2Bucket,
  userId: string
): Promise<void> {
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

