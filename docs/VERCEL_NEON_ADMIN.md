# Full admin on Vercel + Neon — setup guide

This repo now ships the server layer for a real PIN admin on the same
Vercel project, same repo, same URL:
https://shivam-vinod-chaudhari-portfolio.vercel.app

The Muse-hosted portfolio stays the working fallback until the live
Vercel admin is verified (PIN login + an edit persisting + a contact
message in the inbox + resume download).

## Why Vercel alone could not run the admin

The v12 export was static files only: no server code, no database.
A PIN can only stay secret if a *server* checks it — a check in the
browser can be read in DevTools. Same for the inbox and analytics:
there was nowhere to store them. The fix is not a different platform;
it is adding the server layer back on Vercel, with a free Neon database.

## 1. Create the Neon database (free, no card)

Vercel Dashboard > open project `shivam-vinod-chaudhari-portfolio`
(team `shivvdev08-4458`) > **Storage** tab > **Create Database** > **Neon**
> choose the **Free** plan > name it e.g. `portfolio-db` > Create.

Vercel sets `DATABASE_URL` (and related vars) on the project for
Production, Preview and Development automatically, then redeploys.
Free tier: 1 GB storage, pgvector included.

Alternative on your own machine (needs the Vercel CLI signed in):
`vercel link` in the repo, then `vercel install neon` and follow the
prompts. Do not paste any token or URL in chat.

## 2. (Optional) Create a Blob store for uploads

Same Storage tab > **Create Store** > **Blob** > Free plan > Create.
Vercel sets `BLOB_READ_WRITE_TOKEN`. Without it, resume/photo upload
from /admin reports "Blob not configured" and the existing repo PDF
remains the public download. Nothing breaks.

## 3. Choose the admin PIN — privately

Pick a PIN (6–64 characters, not reused elsewhere). It is stored
**nowhere** — only its SHA-256 hex digest goes in Vercel.

Easiest: open `/admin` on the live site, use the on-page hasher
(the PIN never leaves your browser), copy the 64-character hex.
Or locally: `node -e "console.log(require(crypto).createHash(sha256).update(YOUR-PIN).digest(hex))"`

Vercel Dashboard > Project > **Settings > Environment Variables** >
add `ADMIN_PIN_HASH` = that hex value, for Production *and* Preview >
Save, then redeploy (Deployments > latest > Redeploy).

Never put the PIN or its hash in the repo, in chat, or in a screenshot.

## 4. Create the tables and seed the content

1. Open https://shivam-vinod-chaudhari-portfolio.vercel.app/admin
2. Sign in with the PIN.
3. Click **Create tables & seed content**. This runs `db/schema.sql`
   and seeds the verified portfolio content (profile, ASTRA, VERITAS
   co-built with Divya Padukone, SafeGen AI, Data4Viz 1st place,
   Sentiment FinBERT + XGBoost + yfinance, AlertX as "being
   documented", the one verified Memory). Nothing is invented.
4. The dashboard then shows real counts, the inbox and analytics.

## 5. Verify (do not skip)

- PIN login works; 5 wrong PINs in 15 minutes locks further tries.
- Edit something in Content, reload the public site, see it persist.
- Send a test contact message from the public form; it appears in
  Admin > Inbox with status `new`.
- Resume page downloads a real PDF with no sign-in.
- Ask ASTRA a portfolio question; it answers only from published
  content and refuses out-of-scope questions.

## What the server does

- `src/lib/db.ts` — Neon client, only built when `DATABASE_URL` is set.
- `src/lib/admin-auth.ts` — SHA-256 PIN check (timing-safe), HMAC
  session cookie (12 h, httpOnly), rate limiting, audit logging.
- `POST /api/admin/login` — 5 failed attempts / 15 min per IP.
- `POST /api/admin/setup` — creates tables + seeds (owner session).
- `GET/POST /api/admin/data` — dashboard, inbox, analytics, CMS edits.
- `POST /api/contact` — stores the message in Neon when configured,
  otherwise tells the form to fall back to mailto (never pretends it
  was stored).
- `POST /api/astra` — keyword retrieval over published portfolio
  content + owner knowledge entries; refuses out-of-scope questions.
- `GET /api/admin/status`, `GET /api/health` — config state, no secrets.
- Uploads use the Vercel Blob REST API with `BLOB_READ_WRITE_TOKEN`
  (server-side only); without it uploads are honestly disabled.

## Costs — free only

Vercel Hobby (free) + Neon Free (free) + Blob Free (free). No card,
no purchase. Do not upgrade to Vercel Pro or Neon Launch for this.

## Known limits

- The Vercel MCP connector in this workspace returns 403 for the
  `shivvdev08-4458s-projects` team scope, so deployments, env vars and
  Neon cannot be managed from here — use the Vercel Dashboard (above).
- Rate limiting is partly in-memory on serverless functions; the
  database login_attempts table is the durable record.
- Until `DATABASE_URL` and `ADMIN_PIN_HASH` are both set, /admin shows
  the setup checklist and the public site works exactly as before.
