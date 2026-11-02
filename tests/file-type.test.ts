import { test } from 'node:test';
import assert from 'node:assert';
import { validateFileBuffer, MAX_FILE_SIZE } from '../src/lib/file-type';

test('validateFileBuffer detects PNG correctly', () => {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const buffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]).buffer;
  const result = validateFileBuffer(buffer);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.contentType, 'image/png');
  assert.strictEqual(result.extension, 'png');
});

test('validateFileBuffer detects JPEG correctly', () => {
  // JPEG signature: FF D8 FF
  const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]).buffer;
  const result = validateFileBuffer(buffer);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.contentType, 'image/jpeg');
  assert.strictEqual(result.extension, 'jpg');
});

test('validateFileBuffer detects PDF correctly', () => {
  // PDF signature: %PDF- (25 50 44 46 2D)
  const buffer = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]).buffer;
  const result = validateFileBuffer(buffer);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.contentType, 'application/pdf');
  assert.strictEqual(result.extension, 'pdf');
});

test('validateFileBuffer detects WEBP correctly', () => {
  // WEBP signature: RIFF....WEBP
  const buffer = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x24, 0x00, 0x00, 0x00, // size
    0x57, 0x45, 0x42, 0x50, // WEBP
    0x56, 0x50, 0x38, 0x20  // VP8
  ]).buffer;
  const result = validateFileBuffer(buffer);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.contentType, 'image/webp');
  assert.strictEqual(result.extension, 'webp');
});

test('validateFileBuffer rejects unsupported executable or text files', () => {
  const exeBuffer = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]).buffer; // MZ (Windows PE/EXE)
  const result = validateFileBuffer(exeBuffer);
  assert.strictEqual(result.valid, false);
  assert.match(result.error || '', /Unsupported file format/);
});

test('validateFileBuffer rejects files exceeding 5 MB limit', () => {
  const hugeBuffer = new ArrayBuffer(MAX_FILE_SIZE + 1024);
  const result = validateFileBuffer(hugeBuffer);
  assert.strictEqual(result.valid, false);
  assert.match(result.error || '', /exceeds 5 MB limit/);
});

