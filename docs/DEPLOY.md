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
- **Paymob** (optional for payments): API key and integration ID from Paymob dashboard.

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
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL, e.g. `https://mintalist.com` (no trailing slash). Used for links, QR, subdomain detection. |
| `UPLOADTHING_TOKEN` | Yes | UploadThing token (or use UploadThing’s Vercel env integration) |
| `UPLOADTHING_SECRET` | Yes | UploadThing secret |
| `UPLOADTHING_APP_ID` | Yes | UploadThing app ID |
| `HUB_ADMIN_EMAILS` | Optional | Comma-separated emails allowed to access `/hub` |
| `PAYMOB_API_KEY` | For payments | Paymob API key |
| `PAYMOB_INTEGRATION_ID` | For payments | Paymob card integration ID |
| `PAYMOB_IFRAME_ID` | Optional | Paymob iframe ID for hosted checkout |
| `PAYMOB_HMAC_SECRET` | Recommended | Verify redirect callbacks (from Paymob dashboard) |
| `PAYMOB_USERNAME` / `PAYMOB_PASSWORD` | Optional | If Paymob auth uses username/password instead of API key |

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

## 6. Paymob callback (if using payments)

In the Paymob dashboard, set the payment **callback / redirect URL** to:

```
https://your-domain.com/api/checkout/paymob/callback
```

See `docs/PAYMOB_SETUP.md` for full Paymob env and flow.

---

## 7. Subdomain (Platinum tier)

For custom subdomains (e.g. `vendor.mintalist.com`):

1. In your DNS provider, add a **wildcard** A or CNAME: `*.mintalist.com` → your Vercel host (or CNAME to `cname.vercel-dns.com` if using Vercel DNS).
2. In Vercel, add the domain `mintalist.com` and ensure `*.mintalist.com` is allowed if needed.
3. Set `NEXT_PUBLIC_APP_URL=https://mintalist.com` so the app can resolve the main host.

---

## 8. After deploy

- Open `https://your-domain.com` and sign up / sign in to confirm auth.
- Visit **Dashboard** and **Upgrade** to confirm Paymob redirect if configured.
- Optionally run `npx prisma migrate deploy` if you didn’t before.

Build command already runs `prisma generate`; migrations must be run separately (step 4).
