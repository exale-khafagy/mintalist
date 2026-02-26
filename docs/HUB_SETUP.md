# Hub — Management Dashboard

The **Hub** is an internal dashboard for Mintalist staff to manage businesses, vendor tiers, and promo codes.

## Access

- **URL:** `/hub` (e.g. `https://mintalist.com/hub`)
- **Auth:** You must be signed in with Clerk **and** either:
  - your **email** is in `HUB_ADMIN_EMAILS`, or
  - your **Clerk user ID** is in `HUB_ADMIN_USER_IDS`.

## Environment

Add to `.env.local` (or your host’s env):

```env
# Founder / main access: sign in with this email to open /hub
HUB_ADMIN_EMAILS=khafagy.ahmedibrahim@gmail.com

# Optional: comma-separated Clerk user IDs (alternative to emails)
# HUB_ADMIN_USER_IDS=user_2abc...,user_2def...
```

Use **HUB_ADMIN_EMAILS** for access by email (recommended for the founder). Use **HUB_ADMIN_USER_IDS** if you prefer to allow by Clerk user ID.

## Hub features

| Section        | Purpose |
|----------------|--------|
| **Vendors**    | List all businesses; open “Manage” to change a vendor’s tier (FREE / GOLD). |
| **Promo codes**| Create voucher codes (code + tier + optional expiry in days). Vendors redeem them in Dashboard → Settings. |

## Add/remove businesses

- **View/list:** Hub → Vendors.
- **Change tier:** Vendors → Manage → set tier → Save.
- **Delete vendor:** Not in the UI yet; use Prisma Studio or a script if needed.
- **Add business:** New vendors are created when users sign up (Clerk webhook). For manual creation you’d add a script or a future Hub “Invite” flow.

## API (Hub-only)

- `PATCH /api/hub/vendors/[id]` — body `{ "tier": "FREE" \| "GOLD" }`. Requires Hub admin.
- `POST /api/hub/promo` — body `{ "code": "PROMO1", "tier": "GOLD", "expiresInDays": 30 }`. Creates a voucher. Requires Hub admin.
