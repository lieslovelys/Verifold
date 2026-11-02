import { test } from 'node:test';
import assert from 'node:assert';
import { checkRateLimit } from '../src/lib/rate-limit';

test('checkRateLimit allows requests up to the limit', () => {
  const key = 'test-ip-' + Math.random();
  const limit = 3;

  const r1 = checkRateLimit(key, limit, 10);
  assert.strictEqual(r1.allowed, true);
  assert.strictEqual(r1.remaining, 2);

  const r2 = checkRateLimit(key, limit, 10);
  assert.strictEqual(r2.allowed, true);
  assert.strictEqual(r2.remaining, 1);

  const r3 = checkRateLimit(key, limit, 10);
  assert.strictEqual(r3.allowed, true);
  assert.strictEqual(r3.remaining, 0);

  // 4th request must be blocked
  const r4 = checkRateLimit(key, limit, 10);
  assert.strictEqual(r4.allowed, false);
  assert.strictEqual(r4.remaining, 0);
  assert.ok(r4.resetIn > 0);
});

