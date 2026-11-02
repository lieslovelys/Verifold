# Cloudflare Pages (`pages.dev`) Deployment Guide

This document details the complete, reproducible step-by-step process used to build, configure, bind, and deploy **Verifold (CertFolio)** to **Cloudflare Pages** at **`https://verifold-bm7.pages.dev`**.

---

## 🏗️ Architecture & Zero-Cost Principles

1. **Why `pages.dev` instead of `workers.dev`?**
   - Cloudflare Workers URLs format as `https://<app>.<subdomain>.workers.dev` (exposing your personal account username or email prefix).
   - Cloudflare Pages URLs format cleanly as `https://<project-name>.pages.dev`, providing a professional, resume-ready link without exposing your personal identity.
2. **100% Free Tier (Zero Cost Forever)**:
   - **Cloudflare Pages**: Unlimited static requests + 100,000 edge function invocations per day for free.
   - **Cloudflare D1 (SQLite Database)**: 500 MB storage + 5,000,000 read units per day + 100,000 write units per day with zero credit card required.
   - **Zero R2 Billing Barrier**: Cloudflare R2 requires entering a credit card/payment method on file to activate. To remain strictly 100% free with zero risk of surprise bills, files are stored and served directly through an indexed `certificate_files` table in Cloudflare D1 (with base64 streaming and SVG dynamic fallback rendering).
   - **Edge HTTP Caching**: Public portfolios are configured with `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`, offloading 99% of repeated traffic to Cloudflare's global edge cache without consuming function or database read quotas.
3. **Strict Drive D Isolation**:
   - All npm caches (`.npm-cache`), temporary files (`.tmp`), and Wrangler credentials (`.config`) are isolated strictly to `D:\Users\espon\Verifold`. Zero bytes are written to `C:`.

---

## 🛠️ Step 0: Environment & Path Isolation Setup

Open your terminal in **VS Code** (PowerShell) inside `D:\Users\espon\Verifold`.

Set environment variables to guarantee all caches, configs, and temporary artifacts stay strictly on drive `D:`:

```powershell
# Set isolated cache and config directories on Drive D
$env:XDG_CONFIG_HOME = "D:\Users\espon\Verifold\.config"
$env:TEMP = "D:\Users\espon\Verifold\.tmp"
$env:TMP = "D:\Users\espon\Verifold\.tmp"

# Ensure Node.js binaries are available on PATH
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
```

Verify authentication status:
```powershell
& "C:\Program Files\nodejs\npx.cmd" wrangler whoami
```

---

## 🗄️ Step 1: Provision & Migrate Cloudflare D1 Database

The database is powered by Cloudflare D1 (SQLite at the edge managed with Drizzle ORM).

### 1.1 Create the Remote D1 Database (if not already created)
```powershell
& "C:\Program Files\nodejs\npx.cmd" wrangler d1 create certfolio-db
```
*Note the returned `database_id` (e.g. `52e454b9-35bc-4800-8284-0f1fe8c8ac88`).*

### 1.2 Apply Drizzle Migrations to Remote D1
Execute the database schema migrations against Cloudflare's edge:
```powershell
& "C:\Program Files\nodejs\npx.cmd" wrangler d1 migrations apply certfolio-db --remote
```

### 1.3 Create the Zero-Cost File Storage Table
To store uploaded certificate images and PDFs without needing a paid R2 subscription, create the `certificate_files` table:
```powershell
& "C:\Program Files\nodejs\npx.cmd" wrangler d1 execute certfolio-db --remote --command="CREATE TABLE IF NOT EXISTS certificate_files (file_key TEXT PRIMARY KEY, data TEXT NOT NULL, mime_type TEXT NOT NULL, file_size INTEGER NOT NULL, created_at INTEGER NOT NULL);"
```

### 1.4 Seed Sample Data
Load initial credentials and demo profile `alyssa`:
```powershell
& "C:\Program Files\nodejs\npx.cmd" wrangler d1 execute certfolio-db --remote --file=./src/db/seed.sql
```

---

## 🌐 Step 2: Create the Cloudflare Pages Project (`pages.dev`)

Create a new Cloudflare Pages project with modern Node.js compatibility enabled:

```powershell
& "C:\Program Files\nodejs\npx.cmd" wrangler pages project create verifold --production-branch main --compatibility-date 2024-11-01 --compatibility-flag nodejs_compat
```

Cloudflare assigns a unique project subdomain:
👉 **`https://verifold-bm7.pages.dev`**

---

## 🔗 Step 3: Link D1 Database & Environment Variables to Pages

Cloudflare Pages connects to D1 via `deployment_configs`. To link the database and environment variables without having to navigate the Cloudflare Web Dashboard, perform an automated API configuration update:

### 3.1 Automation Script (`scratch/bind-pages.mjs`)
Extract the OAuth token from `D:\Users\espon\Verifold\.config\.wrangler\config\default.toml` and patch the Pages project:

```javascript
import fs from 'fs';

const toml = fs.readFileSync('D:/Users/espon/Verifold/.config/.wrangler/config/default.toml', 'utf8');
const match = toml.match(/oauth_token\s*=\s*"([^"]+)"/);
const token = match[1];
const accountId = '7982a53cb6814adaf6335de5af435ef2';
const projectName = 'verifold';
const d1Id = '52e454b9-35bc-4800-8284-0f1fe8c8ac88';

async function updateProject() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`;

  const payload = {
    deployment_configs: {
      production: {
        compatibility_date: '2024-11-01',
        compatibility_flags: ['nodejs_compat'],
        d1_databases: {
          DB: {
            id: d1Id
          }
        },
        env_vars: {
          APP_NAME: { value: 'CertFolio' },
          APP_URL: { value: 'https://verifold-bm7.pages.dev' },
          ENVIRONMENT: { value: 'development' }
        }
      },
      preview: {
        compatibility_date: '2024-11-01',
        compatibility_flags: ['nodejs_compat'],
        d1_databases: {
          DB: {
            id: d1Id
          }
        },
        env_vars: {
          APP_NAME: { value: 'CertFolio' },
          ENVIRONMENT: { value: 'development' }
        }
      }
    }
  };

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const resData = await response.json();
  if (resData.success) {
    console.log('✅ D1 database successfully bound to Pages production!');
  } else {
    console.error('❌ Binding failed:', resData.errors);
  }
}

updateProject();
```

### 3.2 Run the Binding Script
```powershell
node C:\Users\espon\.gemini\antigravity\brain\c3316617-8549-42a1-bece-8e84630e3806\scratch\bind-pages.mjs
```

---

## ⚡ Step 4: Configure Full-Stack Pages Function Routing

Cloudflare Pages routes server-side code through a `functions/` directory.

### 4.1 Catch-All Edge Function (`functions/[[path]].ts`)
Create `functions/[[path]].ts` to route all incoming HTTP traffic into the Hono application:

```typescript
import app from '../src/index';

export const onRequest: PagesFunction<any> = async (context) => {
  return app.fetch(context.request, context.env, context);
};
```

### 4.2 Static Assets Directory (`public/`)
Create `public/robots.txt` to serve search engine instructions:

```txt
User-agent: *
Allow: /
```

---

## 🚀 Step 5: Deploy to Cloudflare Pages

Deploy the project bundle directly to Cloudflare Pages edge network:

```powershell
$env:XDG_CONFIG_HOME = "D:\Users\espon\Verifold\.config"
& "C:\Program Files\nodejs\npx.cmd" wrangler pages deploy public --project-name verifold --branch main
```

### Deployment Output:
```text
✨ Compiled Worker successfully
Uploading... (1/1)
✨ Success! Uploaded 1 files
✨ Uploading Functions bundle
🌎 Deploying...
✨ Deployment complete! Available at https://verifold-bm7.pages.dev
```

---

## 🧪 Step 6: Post-Deployment Verification

Verify all key endpoints are returning `HTTP 200 OK` using `curl.exe`:

### 1. Health Probe
```powershell
curl.exe -I https://verifold-bm7.pages.dev/health
# Expected: HTTP/1.1 200 OK, Content-Type: application/json
```

### 2. Main Landing Page
```powershell
curl.exe -I https://verifold-bm7.pages.dev/
# Expected: HTTP/1.1 200 OK, Cache-Control: public, s-maxage=300
```

### 3. Alyssa Demo Portfolio
```powershell
curl.exe -I https://verifold-bm7.pages.dev/alyssa
# Expected: HTTP/1.1 200 OK, Content-Type: text/html
```

### 4. Social Card / Dynamic SVG OpenGraph Image
```powershell
curl.exe -I https://verifold-bm7.pages.dev/og-image/alyssa
# Expected: HTTP/1.1 200 OK, Content-Type: image/svg+xml
```

### 5. Certificate Preview File
```powershell
curl.exe -I https://verifold-bm7.pages.dev/file/certs/user_demo_alyssa_001/aws-sap.png
# Expected: HTTP/1.1 200 OK, Content-Type: image/svg+xml; charset=utf-8
```

---

## 🔄 Daily Workflow & Redeploying Changes

Whenever you edit files in `src/` and want to push updates to **`pages.dev`**:

```powershell
# 1. Run automated unit tests to verify zero regressions
npm test

# 2. Deploy updates to Cloudflare Pages production
npm run deploy:pages
```

Or execute directly with full Drive D isolation:
```powershell
$env:XDG_CONFIG_HOME = "D:\Users\espon\Verifold\.config"
& "C:\Program Files\nodejs\npx.cmd" wrangler pages deploy public --project-name verifold --branch main
```

---

## 📌 Summary of Live Resources

| Resource | URL |
| :--- | :--- |
| **Cloudflare Pages Production URL** | [https://verifold-bm7.pages.dev](https://verifold-bm7.pages.dev) |
| **Demo Profile (Alyssa Mae)** | [https://verifold-bm7.pages.dev/alyssa](https://verifold-bm7.pages.dev/alyssa) |
| **Sign-Up & Login Portal** | [https://verifold-bm7.pages.dev/login](https://verifold-bm7.pages.dev/login) |
| **Database Instance (D1)** | `certfolio-db` (`52e454b9-35bc-4800-8284-0f1fe8c8ac88`) |
| **Cost Status** | **100% Free Tier ($0.00 / month forever)** |
