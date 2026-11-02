import { z } from 'zod';

export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'api',
  'login',
  'signin',
  'logout',
  'signout',
  'signup',
  'register',
  'dashboard',
  'settings',
  'static',
  'assets',
  'about',
  'terms',
  'privacy',
  'verify',
  'file',
  'files',
  'og-image',
  'health',
  'certfolio',
  'app',
  'auth',
]);

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(
    /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
    'Username can only contain lowercase letters, numbers, and hyphens (cannot start or end with a hyphen)'
  )
  .refine((val) => !RESERVED_USERNAMES.has(val.toLowerCase()), {
    message: 'This username is reserved and cannot be chosen',
  });

export const onboardingSchema = z.object({
  username: usernameSchema,
  displayName: z.string().trim().min(1, 'Display name is required').max(60),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name cannot be empty').max(60),
  bio: z.string().trim().max(300, 'Bio must be at most 300 characters').optional().or(z.literal('')),
  accentColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color code (e.g. #2563eb)')
    .default('#2563eb'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  layout: z.enum(['grid', 'list', 'timeline']).default('grid'),
});

export const certificateCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title is too long'),
  issuer: z.string().trim().min(1, 'Issuer is required').max(100, 'Issuer is too long'),
  issuedAt: z
    .string()
    .regex(/^\d{4}(-\d{2})?(-\d{2})?$/, 'Date must be in YYYY, YYYY-MM, or YYYY-MM-DD format'),
  category: z.string().trim().max(50, 'Category is too long').default('General'),
  description: z.string().trim().max(1000, 'Description must be 1000 characters or less').optional().or(z.literal('')),
  verifyUrl: z.string().trim().url('Invalid verification URL').optional().or(z.literal('')),
  isPublic: z.coerce.number().min(0).max(1).default(1),
});

export const certificateUpdateSchema = certificateCreateSchema.partial();

export const emailLoginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
});

export const verifyCodeSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  code: z.string().trim().min(6).max(6),
});

export const reorderSchema = z.object({
  order: z.array(z.string().min(1)),
});

