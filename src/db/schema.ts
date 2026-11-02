import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    username: text('username').unique(), // Lowercase, 3-30 chars, set during onboarding
    displayName: text('display_name'),
    bio: text('bio'),
    accentColor: text('accent_color').default('#2563eb'), // Default Tailwind blue-600
    theme: text('theme').default('system'), // 'light' | 'dark' | 'system'
    layout: text('layout').default('grid'), // 'grid' | 'list' | 'timeline'
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    usernameIdx: uniqueIndex('idx_users_username').on(table.username),
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
  })
);

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    tokenHashIdx: uniqueIndex('idx_sessions_token_hash').on(table.tokenHash),
    userIdIdx: index('idx_sessions_user_id').on(table.userId),
  })
);

export const magicTokens = sqliteTable(
  'magic_tokens',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    tokenHash: text('token_hash').notNull().unique(),
    code: text('code').notNull(), // 6-digit backup entry code
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    tokenHashIdx: uniqueIndex('idx_magic_tokens_token_hash').on(table.tokenHash),
    emailIdx: index('idx_magic_tokens_email').on(table.email),
  })
);

export const certificates = sqliteTable(
  'certificates',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    issuer: text('issuer').notNull(),
    issuedAt: text('issued_at').notNull(), // YYYY-MM or YYYY-MM-DD
    category: text('category').default('General'),
    description: text('description'),
    fileKey: text('file_key').notNull(), // Key inside Cloudflare R2
    fileType: text('file_type').notNull(), // 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf'
    fileName: text('file_name'),
    fileSize: integer('file_size'),
    verifyUrl: text('verify_url'),
    sortOrder: integer('sort_order').notNull().default(0),
    isPublic: integer('is_public').notNull().default(1), // 1 = public, 0 = private
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_certificates_user_id').on(table.userId),
    sortOrderIdx: index('idx_certificates_sort_order').on(table.userId, table.sortOrder),
    publicIdx: index('idx_certificates_public').on(table.userId, table.isPublic),
  })
);

export const profileViews = sqliteTable(
  'profile_views',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    viewedAt: integer('viewed_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_profile_views_user_id').on(table.userId),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;
export type Session = typeof sessions.$inferSelect;

