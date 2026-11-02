export type AllowedFileType = 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf';

export interface FileValidationResult {
  valid: boolean;
  contentType?: AllowedFileType;
  extension?: string;
  error?: string;
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Validates a file by inspecting its raw magic bytes (first few bytes of the buffer).
 * Does not trust user-supplied Content-Type or file extension.
 */
export function validateFileBuffer(buffer: ArrayBuffer): FileValidationResult {
  if (!buffer || buffer.byteLength === 0) {
    return { valid: false, error: 'Empty file provided' };
  }

  if (buffer.byteLength > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 5 MB limit' };
  }

  const bytes = new Uint8Array(buffer.slice(0, 16));

  // 1. Check PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { valid: true, contentType: 'image/png', extension: 'png' };
  }

  // 2. Check JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { valid: true, contentType: 'image/jpeg', extension: 'jpg' };
  }

  // 3. Check PDF: %PDF- (25 50 44 46 2D)
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return { valid: true, contentType: 'application/pdf', extension: 'pdf' };
  }

  // 4. Check WEBP: Starts with 'RIFF' (52 49 46 46) and at byte 8 'WEBP' (57 45 42 50)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { valid: true, contentType: 'image/webp', extension: 'webp' };
  }

  return {
    valid: false,
    error: 'Unsupported file format. Only PNG, JPEG, WEBP, and PDF files are accepted.',
  };
}

