# 📜 CertFolio (Verifold)

> **Free, fast, edge-hosted certificate portfolio web app** where anyone can sign up, upload their credentials (PDF / Images), and share a single verified public link on their resume or LinkedIn.

Built on **Cloudflare Workers**, **Hono**, **Cloudflare D1** (SQLite via **Drizzle ORM**), **Cloudflare R2** object storage, and styled with mobile-first **Tailwind CSS**.

---

## 🌟 Key Features

### Core MVP Features
- **Edge Performance & SEO**: Server-rendered HTML powered by Hono on Cloudflare Workers edge nodes (< 30ms latency worldwide).
- **Edge-Native Authentication**: Passwordless magic-link and 6-digit code authentication with cryptographic sessions stored in D1 and `HttpOnly` secure cookies.
- **Custom Username Onboarding**: Users claim an immutable vanity handle on first sign-in (`certfolio.pages.dev/{username}`).
- **Private Dashboard**:
  - Add, edit, and delete certificates.
  - Upload certificates as **PNG, JPEG, WEBP, or PDF** (up to 5 MB per file).
  - Server-side magic-byte inspection (ensures real file content types, not just extensions).
  - Toggle each certificate between **Public** and **Private** with one click.
  - Profile customization: Display Name, Headline Bio, and Custom Hex Accent Color.
- **Public Profile (`/{username}`)**:
  - Profile header with initials avatar, display name, handle, bio, and verified credential counter.
  - Responsive certificate card grid with thumbnails and metadata.
  - Full-screen interactive viewer modal for high-res images and embedded PDFs.
  - Live client-side category filter pills and keyword search.
  - "Verify" badge linking to official issuer URLs (Credly, Coursera, Universities, etc.).
  - OpenGraph and Twitter card meta tags for rich previews on LinkedIn, Slack, and X.
- **Modern Landing Page**: High-converting showcase with live sample credentials, metric counters, and dark/light mode toggle.

### Built-in Nice-to-Haves
- **Drag-and-Drop / Reordering**: Up/Down order controls to prioritize your most prestigious certifications.
- **Dynamic Themes & Layouts**: Switch between Grid Cards, Detailed List, or Chronological Timeline views.
- **Portfolio View Counter**: Privacy-respecting visit counter recorded in D1 (ignoring visits from the owner).
- **"Save as PDF" / Print View**: Clean print stylesheet tailored for exporting your certificate portfolio directly to PDF.
- **Dynamic Social OG Image**: Automated SVG Open Graph card generator at `/og-image/:username`.
- **Account Deletion (GDPR/Safety)**: Deletes all database records in D1 and removes all associated files from Cloudflare R2 in one clean sweep.

---

## 🛡️ Limits & Safety Guardrails

- **File Validation**: Files checked via byte signatures (`89 50 4E 47` for PNG, `FF D8 FF` for JPEG, `RIFF...WEBP` for WEBP, `%PDF-` for PDF). Max size 5 MB.
- **Quota**: Max 30 certificates per user.
- **Reserved Handles**: Blocks system routes (`admin`, `api`, `login`, `signup`, `dashboard`, `settings`, `static`, `assets`, `privacy`, `terms`, `verify`, etc.).
- **Username Syntax**: 3–30 chars, lowercase letters, numbers, and hyphens (cannot start or end with a hyphen).
- **Isolation**: Every read, update, or deletion query enforces strict tenant ownership (`WHERE id = ? AND userId = ?`).
- **Private File Protection**: Private files (`isPublic = 0`) are served only to their verified owner with `Cache-Control: private, no-store`. Public files have immutable edge caching.
- **Rate Limiting**: Sliding window rate limiter protects auth endpoints (6 req/min) and upload endpoints (20 req/min).

---

## 📂 Project Structure

```
Verifold/
├── src/
│   ├── db/
│   │   ├── schema.ts            # Drizzle ORM schema (users, sessions, magicTokens, certificates, profileViews)
│   │   ├── index.ts             # D1 Drizzle connection factory
│   │   ├── seed.sql             # SQL seed dataset (demo user 'alyssa' & credentials)
│   │   └── seed.ts              # Seed documentation
│   ├── lib/
│   │   ├── auth.ts              # Edge Web Crypto auth, SHA-256 tokens, session cookies
│   │   ├── validation.ts        # Zod input validation & reserved usernames
│   │   ├── file-type.ts         # Magic-byte file validation (PNG, JPG, WEBP, PDF)
│   │   ├── sanitize.ts          # HTML entity escaping & XSS sanitization
│   │   ├── rate-limit.ts        # Edge in-memory sliding window rate limiter
│   │   └── r2.ts                # Cloudflare R2 upload, fetch, and cascade delete
│   ├── views/
│   │   ├── layout.ts            # Base HTML5 layout (Tailwind CDN, dark/light theme, OG tags)
│   │   ├── components.ts        # Navbar, footer, certificate card, full-screen modal
│   │   └── pages/
│   │       ├── landing.ts       # Marketing landing page & hero
│   │       ├── auth.ts          # Magic link & 6-digit code entry UI
│   │       ├── onboarding.ts    # First-login username claim page
│   │       ├── dashboard.ts     # Private CRUD dashboard & reorder
│   │       ├── profile-edit.ts  # Settings & account deletion
│   │       ├── portfolio.ts     # Public /{username} portfolio page
│   │       └── not-found.ts     # Accessible 404 / error states
│   ├── routes/
│   │   ├── auth.ts              # /login, /signup, /auth/send-magic, /auth/verify, /auth/logout
│   │   ├── dashboard.ts         # /onboarding, /dashboard, /dashboard/profile
│   │   ├── api.ts               # /api/certificates (CRUD, upload, toggle, reorder)
│   │   ├── files.ts             # /file/:key (authenticated & public R2 streaming)
│   │   └── public.ts            # /, /{username}, /og-image/:username
│   └── index.ts                 # Main Hono app entrypoint & middleware
├── drizzle/                     # Drizzle SQL migration files
├── tests/                       # Automated test suites (file-type, validation, auth, rate-limit)
├── wrangler.jsonc               # Cloudflare Workers configuration (D1 & R2 bindings)
├── drizzle.config.ts            # Drizzle Kit configuration
├── package.json                 # Project scripts & dependencies
└── tsconfig.json                # TypeScript strict configuration
```

---

## 🚀 Setup & Local Development (Inside VS Code Terminal)

You can run everything directly inside the **VS Code Integrated Terminal** (`Ctrl + \`` or `Terminal` > `New Terminal`).

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment variables:
```bash
cp .dev.vars.example .dev.vars
```

### 3. Generate & Apply Local Database Migrations
```bash
# Generate SQL migrations if schema changed
npm run db:generate

# Apply migrations to your local Cloudflare D1 SQLite database
npm run db:migrate:local

# (Optional) Seed the database with sample demo portfolio ('alyssa')
npm run db:seed
```

### 4. Run the Dev Server
```bash
npm run dev
```
Open **[http://localhost:8787](http://localhost:8787)** in your browser!

> **💡 Quick Dev Mode Sign-In**:
> When logging in locally, enter any email (e.g. `you@example.com`). In dev mode, CertFolio immediately displays your **One-Click Magic Sign-In button** and **6-digit verification code** on screen, allowing effortless testing without an external SMTP mail server!

### 5. Run the Automated Test Suite
```bash
npm test
```

---

## ☁️ Deployment to Cloudflare Workers

Deploying CertFolio to your live Cloudflare account takes less than 2 minutes:

### 1. Authenticate with Cloudflare
```bash
npx wrangler login
```

### 2. Provision Remote D1 Database & R2 Bucket
```bash
# Create D1 database
npx wrangler d1 create certfolio-db

# Create R2 storage bucket
npx wrangler r2 bucket create certfolio-bucket
```

### 3. Update `wrangler.jsonc`
Paste the generated `database_id` from the D1 output into `wrangler.jsonc`:
```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "certfolio-db",
    "database_id": "your-database-id-here",
    "migrations_dir": "drizzle"
  }
]
```

### 4. Apply Migrations to Remote D1
```bash
npm run db:migrate:remote
```

### 5. Deploy Worker
```bash
npm run deploy
```

---

## 📐 Architecture & Design Decisions

### Why Cloudflare Workers, D1, and R2?
1. **Zero Cold Starts & Global Latency**: Traditional Node.js containers can suffer 2–5s cold starts. Cloudflare Workers run on V8 isolates with zero cold start latency, serving HTML in < 30ms from edge nodes closest to the user.
2. **Server-Rendered Hono for SEO**: Because certificate portfolios are shared on LinkedIn and job applications, SSR ensures Googlebot, LinkedIn scrapers, and Twitter card bots immediately see pre-rendered meta tags, titles, and descriptions without requiring JavaScript execution.
3. **Generous Free Tier Limits**:
   - Cloudflare Workers: 100,000 requests/day free.
   - Cloudflare D1: 5 million reads/day, 500 MB database free.
   - Cloudflare R2: 10 GB free object storage with **$0 egress fees** (unlike AWS S3 which charges per gigabyte of outbound traffic).
   - Public pages and static certificates are cached with edge `Cache-Control` headers, ensuring the app comfortably scales to thousands of monthly portfolio views without leaving the free tier.
4. **Edge-Native Authentication vs. Heavy Libraries**:
   - Heavy auth libraries frequently import Node.js runtime modules (`crypto`, `buffer`, native bindings) that bloat Workers bundles or break across edge isolates.
   - CertFolio uses standard **Web Crypto API** (`crypto.subtle`, SHA-256 hex hashing) and Edge D1 sessions. It adds 0 KB to the bundle, requires no external dependencies, and provides instant local testing.

---

## 📋 Manual Testing Checklist

| Step | Action | Expected Result |
|---|---|---|
| **1. Landing Page** | Visit `/` | Hero renders with sample cards, dark/light mode toggle works without flickering. |
| **2. Demo Profile** | Visit `/alyssa` | Alyssa's public portfolio loads with 4 seeded certificates, category pills, search bar, and verified badge. |
| **3. Sign In** | Visit `/login`, enter `test@example.com` | Magic sign-in screen appears with 6-digit code and one-click login helper. |
| **4. Onboarding** | Complete sign in as new user | Prompted to pick a unique username (e.g. `devjane`). Typing non-allowed chars or reserved words shows validation error. |
| **5. Add Certificate** | Click `Add Certificate` in `/dashboard` | Upload a PDF or PNG (< 5 MB). File magic bytes are verified on server. Record appears in list. |
| **6. Visibility Toggle** | Toggle certificate from Public to Private | Status badge updates. Visiting `/username` as a public visitor hides the private certificate. |
| **7. Reorder** | Use Up/Down arrows to reorder certificates | Order saves automatically in D1; public profile displays updated order. |
| **8. Profile Settings** | Go to `/dashboard/profile`, change accent color to Emerald `#059669` | Public portfolio immediately reflects emerald branding. |
| **9. PDF Export** | Click "Save as PDF" on public profile | Browser print dialog opens with print-optimized CSS hiding navigation bars. |
| **10. Account Delete** | Click "Delete Account" in settings | D1 cascades deletion of user, sessions, certificates, and clears files in R2. User is logged out and redirected to `/`. |

---

## 💼 Resume Highlights

- **Engineered an edge-native multi-tenant portfolio platform** using Cloudflare Workers, Hono, D1 (SQLite), and R2, reducing global Time to First Byte (TTFB) to under 30ms while operating completely within Cloudflare's free tier.
- **Implemented passwordless cryptographic edge authentication** utilizing the Web Crypto API (SHA-256 token hashing) and secure session cookies, eliminating external auth latency and cold-start overhead.
- **Architected multi-tenant file security and magic-byte validation**, enforcing server-side content-type inspection for PDFs and images, ownership isolation, and differential edge cache headers for public vs. private credentials.

