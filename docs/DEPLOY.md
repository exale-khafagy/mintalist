# Deploying Mintalist

This guide covers deploying to **Vercel** (recommended for Next.js). The app can also run on other Node hosts (Railway, Render, etc.) with the same env vars and `npm run build` / `npm start`.

**Repository:** [https://github.com/exale-khafagy/mintalist](https://github.com/exale-khafagy/mintalist)  
Clone: `git clone https://github.com/exale-khafagy/mintalist.git`

---

## 1. Prerequisites

- **Git**: repo pushed to GitHub (e.g. [exale-khafagy/mintalist](https://github.com/exale-khafagy/mintalist)), GitLab, or Bitbucket.
- **Clerk**: production keys from [Clerk Dashboard](https://dashboard.clerk.com).
- **Neon**: production Postgres (or reuse existing `DATABASE_URL`).
- **UploadThing**: already project-linked; use same app or create a production app.

---

## 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New Project** → Import from GitHub and select **exale-khafagy/mintalist** (or paste the repo URL).
3. Set **Root Directory** to `mintalist` if the repo root is the parent folder (e.g. repo is `Mintalist` with app in `mintalist/`). If the repo root is the app itself, leave Root Directory blank.
4. **Build & Development** (leave as-is unless you use a monorepo):
   - Build Command: `npm run build` (runs `prisma generate` then `next build`).
   - Output: Next.js (auto-detected).
   - Install Command: `npm install`.
5. Add **Environment Variables** (see below), then deploy.

---

## 3. Environment variables

Set these in Vercel: **Project → Settings → Environment Variables**. Use **Production** (and optionally Preview) for each.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon (or other) Postgres URL, e.g. `postgresql://user:pass@host/db?sslmode=require` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key (production) |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key (production) |
| `CLERK_WEBHOOK_SECRET` | Yes | From Clerk Dashboard → Webhooks → Signing Secret (endpoint: `https://your-domain.com/api/webhooks/clerk`) |
| `NEXT_PUBLIC_APP_URL` | Yes | The **exact** URL people use to open your app, e.g. `https://www.mintalist.com` or `https://mintalist.com` (no trailing slash). Dashboard “Your public menu” link and QR codes use this. Must match your Vercel domain. |
| `UPLOADTHING_TOKEN` | Yes | UploadThing token (or use UploadThing’s Vercel env integration) |
| `UPLOADTHING_SECRET` | Yes | UploadThing secret (must match the app that defines `logoUploader` and `backgroundImageUploader` in `app/api/uploadthing/core.ts`). "Invalid token" usually means the secret is wrong or missing. |
| `UPLOADTHING_APP_ID` | Yes | UploadThing app ID (same app as above) |
| `HUB_ADMIN_EMAILS` | Optional | Comma-separated emails allowed to access `/hub` |

**Hub access:** To open `/hub` as an admin (e.g. founder), set `HUB_ADMIN_EMAILS=khafagy.ahmedibrahim@gmail.com` (or your email) in Vercel. Sign in with that email, then go to `https://your-domain.com/hub`. See [HUB_SETUP.md](./HUB_SETUP.md).

**DNS and “can’t reach this page” (NXDOMAIN):** If the dashboard shows a link like `https://mintalist.com/your-slug` but opening it gives “can’t reach this page” or `DNS_PROBE_FINISHED_NXDOMAIN`, the domain is not resolving. Add the domain in Vercel (**Project → Settings → Domains**), then in your DNS provider point `mintalist.com` and/or `www.mintalist.com` to Vercel (CNAME or A record as Vercel instructs). Set `NEXT_PUBLIC_APP_URL` to the URL that actually works (e.g. `https://www.mintalist.com` if you use www).

---

## 4. Database migrations

Run migrations against the **production** database before or right after first deploy:

```bash
# Use production DATABASE_URL (from Vercel or .env.production)
npx prisma migrate deploy
```

Or with a direct URL:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 5. Clerk production setup

1. In [Clerk Dashboard](https://dashboard.clerk.com), create or select a **Production** instance.
2. Under **Domains**, add your production domain (e.g. `mintalist.com`).
3. Copy the **Publishable key** and **Secret key** into Vercel as above.
4. **Webhooks** → Add endpoint: `https://your-domain.com/api/webhooks/clerk`, subscribe to `user.created` (and any other events you use). Copy the **Signing secret** into `CLERK_WEBHOOK_SECRET`.

---

## 6. Public URLs

Vendor menus use path-based URLs only (e.g. `mintalist.com/your-shop`). Set `NEXT_PUBLIC_APP_URL` to your app URL (e.g. `https://www.mintalist.com` or `https://mintalist.com`) with no trailing slash.

---

## 7. After deploy

- Open `https://your-domain.com` and sign up / sign in to confirm auth.
- Visit **Dashboard** and redeem a voucher in **Settings** to test upgrades.
- Optionally run `npx prisma migrate deploy` if you didn’t before.

Build command already runs `prisma generate`; migrations must be run separately (step 4).
