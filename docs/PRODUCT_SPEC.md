# Mintalist — Product Specification

**Domain:** [mintalist.com](https://mintalist.com) (owned)  
**Positioning:** Linktree for restaurants and cafes. One link (or QR code) → digital menu, socials, contact, and location.

---

## Who It’s For

- **Business owners:** Restaurants, cafes, food trucks. They sign up, build a public profile, and share one link (or QR) with customers.

---

## What the Product Does

### For business owners (logged-in)

- **Dashboard:** One place to edit their public profile.
- **Profile editor includes:**
  - **Menu** — Add/edit/remove items (name, description, price, availability).
  - **Social links** — Instagram, Facebook, TikTok, X, etc. (direct links).
  - **Custom links** — Any URL (e.g. order online, reservations, delivery).
  - **Location** — e.g. “Downtown” or “Branch 2”.
  - **Address** — Full address.
  - **Phone** — One or more numbers.
  - **Logo** — Uploaded image (all tiers).
- **QR code** — Generate and download a QR that points to their public page (for tables, flyers, etc.).

### For customers (public, no login)

- **Public profile page** shows:
  - Logo and business name.
  - Menu (items, descriptions, prices).
  - Social media links.
  - Custom links.
  - Location name.
  - Address and phone.
  - Map/location link.

Access: either **mintalist.com/[slug]** or **vendor.mintalist.com** (Tier 2).

---

## Tiers and Monetization

| Feature | Free | Tier 1 (Paid) | Tier 2 (Paid) |
|--------|------|----------------|----------------|
| Background | Color only | Background image | Background image |
| Logo | ✅ | ✅ | ✅ |
| Custom URL | No (auto slug) | Yes: **mintalist.com/vendor** | Yes |
| Ads | Ads shown | No ads | No ads |
| Domain | mintalist.com/xxx | mintalist.com/vendor | **vendor.mintalist.com** (subdomain) |

- **Free:** Limited customization, ads. Good for trying the product.
- **Tier 1:** Custom slug, background image, no ads.
- **Tier 2:** Everything in Tier 1 + dedicated subdomain (vendor.mintalist.com).

**Upgrades (no payment in the app):** Users sign up for free. There is no payment in the app. When a vendor wants Gold, they pay you directly (e.g. bank transfer, cash). You or your team generate a **promo code**, send it to them, and they **redeem it in Dashboard → Settings**. That’s the only upgrade path. See **docs/PROJECT_PLAN.md** for dashboard structure and phased implementation.

---

## Technical Tiers (for implementation)

- **FREE** — `tier: FREE` in DB.
- **GOLD** — Custom slug, background image allowed, no ads.

---

## Cost Control (Keep Your Cost Near Zero)

Goal: **$0 fixed cost; pay only when you have revenue or exceed free limits.**

| Service | Role | Cost strategy |
|--------|------|----------------|
| **Vercel** | Host Next.js | Free tier (hobby) or low-cost Pro when needed. |
| **Neon** | Postgres | Free tier; scale only when needed. |
| **Clerk** | Auth | Free tier (e.g. 10k MAU). |
| **UploadThing** | Logo/images | Free tier. |
| *(none)* | Payments | No payment in the app; you collect money directly and send promo codes. |
| **Domain** | mintalist.com | Already paid. |
| **Subdomains** | vendor.mintalist.com | Wildcard DNS `*.mintalist.com` → same app; no extra cost. |

**Ads (Free tier):** Use a low-friction option (e.g. small banner or “Powered by Mintalist” with optional ad block). No need for a paid ad network at first; you can add one later if you want revenue from free users.

---

## Implementation Phases (High Level)

1. **Phase 1 (current)**  
   - Auth (Clerk), DB (Neon/Prisma), Vendor + MenuItem.  
   - Public page at **mintalist.com/[slug]** with menu, logo, basic styling (e.g. brand color).  
   - Dashboard: edit profile, menu, QR code.  
   - Onboarding: name, slug, logo, brand color.

2. **Phase 2 — Profile completeness**  
   - Social links, custom links, address, phone, location.  
   - Schema + dashboard UI for these fields.  
   - Show them on the public profile.

3. **Phase 3 — Voucher redemption**  
   - Voucher model and redeem API; Settings page: “Redeem voucher” → upgrade tier.

4. **Phase 4 — Get Gold page**  
   - Page that explains: no payment in app; pay us directly, we send a code; redeem in Settings. (No payment gateway.)

5. **Phase 5 — Tier enforcement and subdomains (Tier 2)**  
   - DNS: `*.mintalist.com` → app; read Host and serve vendor page at vendor.mintalist.com. Enforce tier features (background image, ads).

6. **Phase 6 — Polish**  
   - Ads placement, background image upload, overview page, UX.

*(Full dashboard structure and phase details: **docs/PROJECT_PLAN.md**.)*

---

## Summary

- **What it does:** Gives restaurants/cafes a single link (and QR) to a public page with menu, socials, links, address, phone, and logo. Owners manage everything from a dashboard.
- **Tiers:** Free (color + logo + ads) → Tier 1 (custom URL + background image + no ads) → Tier 2 (same + subdomain).
- **Cost:** Keep fixed costs at zero using free tiers; add Stripe so you only pay when you earn; subdomains and domain don’t add cost.

Use this doc as the single source of truth for “what Mintalist should do” and for planning payment and tier features.
