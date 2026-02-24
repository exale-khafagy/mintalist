# Mintalist — Project Plan

This document is the single source of truth for the **business dashboard**, **payment flows** (Voucher + Paymob), **assets**, and **phased implementation**.

---

## 1. Brand Assets (Public Folder)

| File | Purpose |
|------|--------|
| `public/mintalist-symbol` | Tab/favicon (browser tab icon). Use as favicon. If it has an extension (e.g. `.png`, `.ico`, `.svg`), reference it in layout. |
| `public/mintalist-logo` | Main logo for the app (landing, header, emails). Same: use with correct extension in layout/marketing. |

**Usage in app:**
- **Favicon:** In `app/layout.tsx` metadata or `app/icon.png` / link rel="icon" pointing to `/mintalist-symbol.*`.
- **Logo:** Use `/mintalist-logo.*` in marketing layout, sign-in/sign-up branding, and dashboard header if desired.

*(Add the actual extension when you add the files, e.g. `mintalist-symbol.png`, `mintalist-logo.png`.)*

---

## 2. Business Dashboard — Full Structure

The dashboard is the **single place** where a logged-in vendor manages their public profile and account. All routes under `/dashboard` are protected.

### 2.1 Dashboard Layout

- **Sidebar or top nav:** Logo, “Mintalist”, then links to each section.
- **Sections:**

| Route | Label | Purpose |
|-------|--------|--------|
| `/dashboard` | Overview | Summary: current tier, link to public profile, quick stats (e.g. menu item count). Optional: “Complete your profile” prompts. |
| `/dashboard/menu` | Menu | CRUD for menu items (name, description, price, isAvailable). Reorder optional later. |
| `/dashboard/profile` | Profile | Business name, slug (if tier allows), logo upload, brand color. For PAID_1/2: background image. |
| `/dashboard/links` | Links | **Social links** (Instagram, Facebook, TikTok, X, etc.) and **custom links** (title + URL). Two sub-sections or one list with type. |
| `/dashboard/location` | Location | Location name, full address, phone number(s). Optional: “Open in Maps” link. |
| `/dashboard/qr` | QR Code | Existing QRCodeGenerator: show QR, download PNG. |
| `/dashboard/settings` | Settings | **Voucher redemption** (input + “Redeem”), **subscription/tier** display, and link to **Upgrade / Checkout** (Paymob). |
| `/dashboard/checkout` | Checkout | Paymob flow: choose Tier 1 or Tier 2, pay via Paymob, then redirect back and activate tier. |

### 2.2 Dashboard Data (Summary)

- **Profile:** name, slug, logoUrl, brandColor, backgroundImageUrl (PAID_1/2).
- **Menu:** MenuItem (name, description, price, isAvailable) per Vendor.
- **Links:** Social links (type + URL) and custom links (title + URL); store in DB (e.g. `VendorSocialLink`, `VendorCustomLink` or a single `Link` model with type).
- **Location:** address, phone, locationName (e.g. “Downtown”) on Vendor or a `VendorLocation` table.
- **Account:** tier (FREE | PAID_1 | PAID_2), voucher redemption in Settings; Paymob payment from Checkout.

---

## 3. Payment Types (No Stripe)

### 3.1 Voucher Code (Offline → Settings)

- **Flow:** You give a vendor a **voucher code** offline (e.g. on paper or WhatsApp). Vendor goes to **Dashboard → Settings**, enters the code in a “Redeem voucher” field, and submits. System validates the code and **upgrades their account** to the tier tied to that voucher (PAID_1 or PAID_2).
- **No checkout:** No payment UI; just “Redeem” in settings.
- **Implementation:**
  - **DB:** `Voucher` model: `code` (unique), `tier` (PAID_1 | PAID_2), `redeemedAt` (optional), `redeemedByVendorId` (optional). Optional: `expiresAt`.
  - **Admin:** You (or a simple admin script) create voucher records (e.g. via Prisma Studio or a small internal tool). No need for a full admin UI in Phase 1.
  - **API:** `POST /api/voucher/redeem` — body: `{ code }`. Auth: current user. Look up voucher by code; if not redeemed and not expired, set `redeemedAt`, `redeemedByVendorId`, and update `Vendor.tier` for the current user’s vendor. Return success/error.
  - **UI:** Settings page: input + “Redeem” button; on success show “You’re now on Tier X” and refresh tier display.

### 3.2 Paymob (Checkout Page)

- **Flow:** Vendor goes to **Dashboard → Upgrade** or **Checkout**. Chooses **Tier 1** or **Tier 2** (and optionally billing period if you support it). Clicks “Pay with Paymob” (or similar). Redirect to Paymob payment page. After successful payment, Paymob redirects back to your **callback URL** (or sends a webhook). Your backend verifies the payment and updates `Vendor.tier` to PAID_1 or PAID_2.
- **Implementation:**
  - **DB:** Optional `Payment` or `PaymobPayment` record: vendorId, tier, amount, Paymob transaction id, status, createdAt — for history and idempotency.
  - **Checkout page:** Client: choose tier → call `POST /api/checkout/paymob` (or similar) with `tier`. Server: create Paymob payment request (using Paymob API), return payment URL (or iframe URL) for redirect.
  - **Callback / Webhook:** Paymob redirects to your URL with success/failure (and possibly HMAC/signature). You verify, then update `Vendor.tier` (and optionally create `Payment`). Redirect user to `/dashboard/settings` with success message.
  - **Env:** Paymob API credentials in `.env` (e.g. `PAYMOB_API_KEY`, `PAYMOB_INTEGRATION_ID`, `PAYMOB_HMAC_SECRET` for callback verification). No extra infra cost; Paymob is the payment provider.

---

## 4. Tiers and Features (Recap)

| Feature | FREE | PAID_1 | PAID_2 |
|--------|------|--------|--------|
| Background | Color only | Background image | Background image |
| Logo | ✅ | ✅ | ✅ |
| Custom slug | Auto only | mintalist.com/vendor | mintalist.com/vendor |
| Subdomain | — | — | vendor.mintalist.com |
| Ads | Shown | No | No |

- **Voucher:** Redeem in Settings → tier set to PAID_1 or PAID_2.
- **Paymob:** Checkout page → pay → callback/webhook → tier set to PAID_1 or PAID_2.

---

## 5. Phases We Will Work On

### Phase 1 — Foundation (Current / In Progress)
- Auth (Clerk), DB (Neon/Prisma), Vendor + MenuItem.
- Public page: **mintalist.com/[slug]** — menu, logo, brand color.
- Onboarding: name, slug, logo, brand color.
- Dashboard shell: layout + navigation (sidebar or top nav).
- Dashboard: **Menu** (CRUD), **Profile** (name, slug, logo, brand color), **QR Code** page (existing component).
- Favicon/logo: use `mintalist-symbol` and `mintalist-logo` from `public/` in layout (once extensions are known).

**Deliverables:** Working dashboard with Menu, Profile, QR; public [slug] page; onboarding.

---

### Phase 2 — Profile Completeness (Links, Location, Public Page)
- **Schema:** Social links, custom links, address, phone, location name (new fields or tables).
- **Dashboard UI:** Profile (extend), **Links** (social + custom), **Location** (address, phone, location name).
- **Public page:** Show menu, social links, custom links, address, phone, location on **mintalist.com/[slug]**.

**Deliverables:** Full profile editable from dashboard; public page shows all of it.

---

### Phase 3 — Voucher Redemption
- **Schema:** `Voucher` model (code, tier, redeemedAt, redeemedByVendorId, optional expiresAt).
- **API:** `POST /api/voucher/redeem` (validate code, update Vendor.tier, mark voucher redeemed).
- **Dashboard → Settings:** “Redeem voucher” input + button; show current tier; success/error feedback.
- **Tooling:** You create vouchers via Prisma Studio or a small script (no admin UI required in this phase).

**Deliverables:** Vendors can redeem vouchers in Settings and get upgraded to PAID_1 or PAID_2.

**Creating vouchers:** Use Prisma Studio (`npx prisma studio`) to insert into `Voucher` (code, tier: PAID_1 or PAID_2, optional expiresAt), or run: `npx tsx scripts/create-voucher.ts <CODE> <PAID_1|PAID_2> [expiresInDays]`.

---

### Phase 4 — Paymob Checkout
- **Env:** Paymob API key, integration id, HMAC secret, callback URL.
- **API:** Create payment (Paymob API), return payment URL; callback route to verify and update tier (and optional Payment record).
- **Dashboard:** “Upgrade” / “Subscribe” entry point in Settings → **Checkout** page (choose Tier 1 or Tier 2, redirect to Paymob, then back to dashboard with success).

**Deliverables:** Vendors can pay via Paymob and be upgraded to PAID_1 or PAID_2; voucher remains for offline upgrades.

---

### Phase 5 — Tier Enforcement and Subdomains
- **Tier rules:** FREE: background color only, show ads; PAID_1/2: allow background image, no ads. Enforce in dashboard (disable/hide background image for FREE) and on public page (ads only for FREE).
- **Subdomain (PAID_2):** DNS: `*.mintalist.com` → app. Middleware rewrites `slug.mintalist.com` to `/{slug}`; public page allows subdomain access only for PAID_2. Set `NEXT_PUBLIC_APP_URL=https://mintalist.com` so subdomain detection works.
- **Custom slug:** PAID_1/2 can edit slug in Profile; FREE sees slug read-only with “Upgrade” link.

**Deliverables:** Tier features enforced; PAID_2 vendors accessible at **slug.mintalist.com**.

---

### Phase 6 — Polish
- Ads placement and design for Free tier.
- Background image upload (UploadThing) and display for PAID_1/2.
- Dashboard overview page (tier, link to profile, prompts).
- Error handling, loading states, and copy tweaks.

---

### Hub — Management Dashboard (Post–Phase 6)
- **URL:** `/hub`. Protected: only users whose Clerk ID is in `HUB_ADMIN_USER_IDS` can access.
- **Vendors:** List all businesses; open a vendor to change tier (FREE / PAID_1 / PAID_2).
- **Promo codes:** Create voucher codes (code + tier + optional expiry). Vendors redeem in Dashboard → Settings.
- **Details:** See `docs/HUB_SETUP.md`.

---

## 6. Summary Table

| Phase | Focus | Main deliverables |
|-------|--------|--------------------|
| **1** | Foundation | Dashboard shell, Menu, Profile, QR, public [slug], onboarding, assets in layout |
| **2** | Profile completeness | Links (social + custom), Location (address, phone), public page shows all |
| **3** | Vouchers | Voucher model, redeem API, Settings “Redeem voucher” UI |
| **4** | Paymob | Checkout page, Paymob integration, callback, tier upgrade on success |
| **5** | Tiers + subdomains | Tier enforcement, ads for FREE, subdomain for PAID_2 |
| **6** | Polish | Ads design, background image, overview, UX |

---

## 7. Asset Reference in Code

Once `mintalist-symbol` and `mintalist-logo` are in `public/` with their final extensions (e.g. `.png`, `.svg`):

- **Favicon:** In `app/layout.tsx`: `icons: { icon: '/mintalist-symbol.png' }` (or use `app/icon.png` and replace that file with the symbol).
- **Logo:** Use `<img src="/mintalist-logo.png" alt="Mintalist" />` in marketing layout and any shared header.

This plan assumes **two payment types only:** (1) **Voucher code** in Settings, (2) **Paymob** on the Checkout page. No Stripe.
