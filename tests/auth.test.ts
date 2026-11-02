import { test } from 'node:test';
import assert from 'node:assert';
import { sha256, generateRandomToken, generate6DigitCode } from '../src/lib/auth';

test('sha256 computes consistent hex hashes', async () => {
  const hash1 = await sha256('hello-world');
  const hash2 = await sha256('hello-world');
  assert.strictEqual(hash1, hash2);
  assert.strictEqual(hash1.length, 64); // 256 bits = 64 hex characters
  // Known SHA-256 for 'hello-world':
  assert.strictEqual(hash1, 'afa27b44d43b02a9fea41d13cedc2e4016cfcf87c5dbf990e593669aa8ce286d');
});

test('generateRandomToken returns unique secure hex strings', () => {
  const t1 = generateRandomToken(32);
  const t2 = generateRandomToken(32);
  assert.strictEqual(t1.length, 64);
  assert.strictEqual(t2.length, 64);
  assert.notStrictEqual(t1, t2);
});

test('generate6DigitCode generates a 6 digit numeric string', () => {
  for (let i = 0; i < 20; i++) {
    const code = generate6DigitCode();
    assert.strictEqual(code.length, 6);
    assert.match(code, /^[1-9][0-9]{5}$/);
  }
});
