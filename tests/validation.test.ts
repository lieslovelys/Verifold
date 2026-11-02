import { test } from 'node:test';
import assert from 'node:assert';
import {
  usernameSchema,
  certificateCreateSchema,
  profileUpdateSchema,
  RESERVED_USERNAMES,
} from '../src/lib/validation';

test('usernameSchema accepts valid usernames', () => {
  assert.strictEqual(usernameSchema.safeParse('johndoe').success, true);
  assert.strictEqual(usernameSchema.safeParse('alice-123').success, true);
  assert.strictEqual(usernameSchema.safeParse('dev-99').success, true);
});

test('usernameSchema rejects reserved usernames', () => {
  for (const reserved of ['admin', 'api', 'login', 'signup', 'dashboard', 'settings']) {
    const res = usernameSchema.safeParse(reserved);
    assert.strictEqual(res.success, false, `Expected ${reserved} to be rejected`);
  }
});

test('usernameSchema rejects invalid formats', () => {
  // Too short (< 3 chars)
  assert.strictEqual(usernameSchema.safeParse('ab').success, false);
  // Starts with hyphen
  assert.strictEqual(usernameSchema.safeParse('-john').success, false);
  // Ends with hyphen
  assert.strictEqual(usernameSchema.safeParse('john-').success, false);
  // Contains uppercase
  assert.strictEqual(usernameSchema.safeParse('JohnDoe').success, false);
  // Contains special symbols
  assert.strictEqual(usernameSchema.safeParse('john_doe').success, false);
  assert.strictEqual(usernameSchema.safeParse('john@doe').success, false);
});

test('certificateCreateSchema validates required fields', () => {
  const valid = {
    title: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    issuedAt: '2024-05',
    category: 'Cloud',
    description: 'Passed with high distinction',
    verifyUrl: 'https://www.credly.com/badges/12345',
    isPublic: 1,
  };
  const result = certificateCreateSchema.safeParse(valid);
  assert.strictEqual(result.success, true);

  // Missing title
  const missingTitle = { ...valid, title: '' };
  assert.strictEqual(certificateCreateSchema.safeParse(missingTitle).success, false);

  // Invalid date format
  const invalidDate = { ...valid, issuedAt: 'invalid-date' };
  assert.strictEqual(certificateCreateSchema.safeParse(invalidDate).success, false);

  // Invalid URL
  const invalidUrl = { ...valid, verifyUrl: 'not-a-url' };
  assert.strictEqual(certificateCreateSchema.safeParse(invalidUrl).success, false);
});

test('profileUpdateSchema validates hex accent colors', () => {
  const valid = {
    displayName: 'Jane Doe',
    bio: 'Software Architect',
    accentColor: '#2563eb',
    theme: 'dark' as const,
    layout: 'grid' as const,
  };
  assert.strictEqual(profileUpdateSchema.safeParse(valid).success, true);

  // Invalid hex color
  assert.strictEqual(
    profileUpdateSchema.safeParse({ ...valid, accentColor: 'blue' }).success,
    false
  );
  assert.strictEqual(
    profileUpdateSchema.safeParse({ ...valid, accentColor: '#12345' }).success,
    false
  );
});

