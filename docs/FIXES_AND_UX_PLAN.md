# Fixes & UX Plan — Journey, Free URL, Layout, Theme, Subscription, Mobile

This document plans the fixes and features requested: onboarding step 1 = business name, free-tier URL not editable, fixed header/navbar, light/dark mode, upgrade/cancel subscription, and mobile view.

---

## 1. Onboarding: First step = Business name (not “menu focus”)

**Current behavior:** Step 1 is “Create your menu” with an optional “What will you put on your menu?” (menuFocus). Step 2 is “Business details” (name, location, address, phone, brand color).

**Required change:** Make step 1 about **business name and location** only. Remove the “menu focus” idea from step 1.

**Implementation:**

- **Reorder steps (keep 5 steps):**
  1. **Your business name and location** — Name (required), location name, address, phone, brand color. Same fields as current step 2; no “menu focus” or “Create your menu” copy.
  2. **Upload logo** — Current step 3 (unchanged).
  3. **Links** — Current step 4 (unchanged).
  4. **Choose your plan** — Current step 5 (unchanged).

- **Remove:** The current step 1 (“Create your menu” + optional menuFocus). Either delete that step and renumber (so 4 steps total) or make step 1 = “Your business name and location” and shift everything (so step 1 = business, 2 = logo, 3 = links, 4 = plan = 4 steps). Plan: **4 steps** — Business name & location, Logo, Links, Choose plan.

- **Files:** `app/onboarding/page.tsx`
  - Update `STEPS` to 4 items: “Your business name and location”, “Logo”, “Links”, “Choose your plan”.
  - Step state 1–4; remove `menuFocus` from schema and form; current “step 2” content becomes step 1; current step 3 → step 2, 4 → 3, 5 → 4.
  - `handleNext`: step 1 saves business details (current saveStep2), step 2 saves logo (current saveStep3), step 3 saves links (current saveStep4), step 4 handles plan (Silver → dashboard, Gold → we send promo code, redeem in Settings).
  - Progress indicator: “Step X of 4”.

---

## 2. Free tier: No option to modify URL in dashboard

**Current behavior:** Profile form uses `canEditSlug = tier === "GOLD"`. For FREE, slug is rendered as `<span>{slug}</span>` inside the same bordered box, with “Custom URL available on Gold. Upgrade”.

**Issue:** Either (a) the block still looks like an input, or (b) tier is not FREE in DB. Ensure UI is clearly read-only and backend stays strict.

**Implementation:**

- **Profile form (`app/dashboard/profile/ProfileForm.tsx`):**
  - For FREE: Do not show an input-like box. Show a simple line: “Your menu link: `mintalist.com/{slug}`” with a “Copy link” button and “Custom URL on Gold or Platinum — Upgrade”.
  - For GOLD: Keep current editable slug input.
  - Ensure `tier` prop is compared strictly (e.g. `tier === "FREE"`).

- **Profile API (`app/api/vendor/profile/route.ts`):**
  - Already rejects slug update for non–PAID tiers (403). No change needed; optional: return a clear error message that “Custom URL is for Gold only”.

- **Verification:** After signup with Silver (FREE), confirm in DB that `Vendor.tier === "FREE"` and that profile page shows the read-only link and no slug input.

---

## 3. Fixed header and navbar (no scroll)

**Current behavior:** Landing header and dashboard sidebar/header are in normal flow and scroll with the page.

**Required change:** Top header (landing + dashboard) and dashboard navbar stay fixed; only the main content scrolls.

**Implementation:**

- **Landing (`app/page.tsx`):**
  - Wrap the top `<header>` in a fixed bar: `fixed top-0 left-0 right-0 z-50 ...` and give the rest of the page `pt-[height of header]` (e.g. `pt-16` or `pt-[4rem]`) so content is not hidden under the header.

- **Dashboard (`app/dashboard/layout.tsx`):**
  - Sidebar is already `fixed inset-y-0 left-0`. Ensure the **top bar** ( “Logged in as …” + “View your shop” + UserButton) is also fixed: e.g. `sticky top-0 z-10` or fixed with `top-0 left-[14rem] right-0` so it stays under the sidebar and doesn’t scroll.
  - Main content: `pl-56` (sidebar width) and add `pt-14` or similar for the top bar height so content starts below the header.
  - Result: sidebar + top bar fixed; only the inner content area scrolls.

- **Public vendor page (`app/[vendorSlug]/page.tsx`):** No app shell navbar; optional: if a small “Mintalist” header is added later, make it fixed the same way.

---

## 4. Light and dark mode

**Current behavior:** `globals.css` has `.dark` theme variables; no theme provider or toggle.

**Required change:** Support light/dark mode with a toggle; persist preference (e.g. localStorage + class on `html`).

**Implementation:**

- **Theme provider:**
  - Use Next.js `next-themes` (or a small custom provider) and wrap the app in `app/layout.tsx`. Apply `class="dark"` to `<html>` when dark mode is active so Tailwind’s `dark:` and CSS variables apply.

- **CSS:** Keep existing `:root` and `.dark` in `globals.css`. Ensure components use semantic colors (`bg-background`, `text-foreground`, `border-border`, etc.) so they respond to theme.

- **Toggle:** Add a theme switcher (e.g. sun/moon icon) in:
  - Landing header (next to Sign in / Get started).
  - Dashboard header (next to “View your shop” or in sidebar footer).
  - Optional: Settings page.

- **Files:** `app/layout.tsx` (wrap with ThemeProvider), `components/ThemeToggle.tsx` (client component), `globals.css` (already has `.dark`; ensure no hardcoded light-only colors in key components).

---

## 5. Upgrade or cancel subscription

**Current behavior:** Settings shows current plan; FREE users get “link to Get Gold (we send a promo code after you pay us directly)”. Checkout page allows choosing Gold/Platinum and paying. No explicit “cancel subscription” flow.

**Required change:** (1) Keep upgrade path clear. (2) Add ability to “cancel” (downgrade to Silver/FREE).

**Implementation:**

- **Upgrade:** Already present (Settings → link to Get Gold (we send a promo code after you pay us directly); Get Gold page). Optional: add a clear “Upgrade plan” card on Settings and/or Overview.

- **Cancel / downgrade:**
  - We do not have payment provider; “cancel” = **downgrade to FREE** in our DB (no recurring billing to cancel to cancel).
  - Add in Settings (for Gold/Platinum): a “Downgrade to Silver” (or “Cancel subscription”) action:
    - Explains: “You’ll keep your data but lose custom URL, background image, subdomain (if Platinum), and go back to ads.”
    - Button “Downgrade to Silver” → confirm dialog → call a new API e.g. `PATCH /api/vendor/subscription` or `POST /api/vendor/downgrade` that sets `Vendor.tier = "FREE"`.
  - Only update `Vendor.tier`; no payment records. If later you add real recurring billing, cancel would be “request downgrade at end of billing period” or similar.

- **Files:** `app/dashboard/settings/page.tsx` (add downgrade section for paid tiers), new `app/api/vendor/downgrade/route.ts` (or extend profile/settings API) to set tier to FREE when user confirms.

---

## 6. Mobile view

**Current behavior:** Layout is desktop-first (sidebar 14rem, single column). Public page and onboarding are responsive to a degree but not optimized for small screens.

**Required change:** Usable, readable experience on mobile: dashboard, landing, onboarding, public vendor page.

**Implementation:**

- **Landing (`app/page.tsx`, `LandingHeader`):**
  - Header: stack or hamburger menu on small screens; keep “Create your menu” and “Sign in” visible (e.g. icon menu or compact buttons).
  - Hero: reduce font sizes, stack CTAs, sufficient padding.

- **Dashboard (`app/dashboard/layout.tsx`):**
  - **Mobile:** Replace fixed sidebar with a bottom nav (Overview, Menu, Profile, Links, …) or a hamburger drawer. Top bar: logo + “View your shop” (icon or short label) + UserButton; keep fixed.
  - **Desktop:** Keep current sidebar + top bar.
  - Use Tailwind breakpoints (`md:` or `lg:`) to switch between sidebar layout and bottom nav / drawer. Main content: full width on mobile, `pl-56` on desktop.

- **Onboarding (`app/onboarding/page.tsx`):**
  - Card: full width with padding on small screens; buttons stack (Back / Next) or stay in a single row; step indicator and form fields already stack; ensure touch targets are large enough.

- **Public vendor page (`app/[vendorSlug]/page.tsx`):**
  - Menu items and links already stack; ensure font sizes and padding work on narrow viewports; “Powered by Mintalist” and footer stay readable.

- **Profile, Settings, Links, Menu, QR, etc.:** Use responsive grid (e.g. single column on mobile, two columns on `md+` where it makes sense); avoid horizontal scroll; tables can become cards on mobile if needed.

- **Files:** `app/dashboard/layout.tsx` (responsive sidebar vs bottom nav/drawer), `app/page.tsx`, `app/onboarding/page.tsx`, `app/[vendorSlug]/page.tsx`, and key dashboard pages (profile, settings, menu, links) with responsive classes.

---

## Implementation order (recommended)

1. **Onboarding step 1 = Business name** — Quick, clear fix to the journey.
2. **Free tier URL in dashboard** — Clarify read-only link and no slug input for FREE.
3. **Fixed header/navbar** — Landing + dashboard so layout is stable.
4. **Mobile: dashboard + landing + onboarding + public page** — One pass for responsive layout and navigation.
5. **Light/dark mode** — Theme provider + toggle + semantic colors.
6. **Upgrade/cancel** — Downgrade-to-Free in Settings + API.

This order keeps journey and access control correct first, then layout and theme, then subscription actions.
