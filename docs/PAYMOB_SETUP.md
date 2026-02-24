# Paymob checkout setup (Phase 4)

## Integration IDs (configured)

| Type            | ID       | Use in app                          |
|-----------------|----------|-------------------------------------|
| **Card**        | 5552481  | `PAYMOB_INTEGRATION_ID` (checkout)  |
| **Mobile wallet** | 5552960 | Reserved for future wallet option   |

The current flow uses the **Card** integration for the Paymob iframe. Mobile wallet ID is stored for later if we add wallet as a payment method.

## Environment variables

Add to `.env.local` (and to Vercel/hosting env for production):

```env
# Paymob Accept – Card integration (required for checkout)
PAYMOB_INTEGRATION_ID=5552481
PAYMOB_API_KEY=your_api_key
PAYMOB_IFRAME_ID=your_iframe_id

# Optional: if auth with api_key fails, use username + password instead
# PAYMOB_USERNAME=...
# PAYMOB_PASSWORD=...

# Optional: custom amounts in cents (default: 10000 = 100 EGP, 100000 = 1000 EGP annual)
# PAYMOB_MONTHLY_CENTS=10000
# PAYMOB_ANNUAL_CENTS=100000

# Callback verification (recommended)
# PAYMOB_HMAC_SECRET=your_hmac_from_dashboard

# Optional: for future mobile wallet support
# PAYMOB_INTEGRATION_ID_MOBILE_WALLET=5552960
```

## What you still need to provide

1. **PAYMOB_API_KEY** – From Paymob dashboard (API Keys or Integration settings).
2. **PAYMOB_IFRAME_ID** – The iframe ID for the **Card** integration (5552481) in your Paymob dashboard (often under the integration’s iframe/acceptance settings).
3. **Callback URL** in Paymob – Set to `https://your-domain.com/api/checkout/paymob/callback` (see below).
4. **PAYMOB_HMAC_SECRET** – (Recommended.) From Paymob dashboard; used to verify redirect callbacks. If set, the callback rejects invalid or missing `hmac` when Paymob sends it.

If Paymob login uses username/password instead of API key, set **PAYMOB_USERNAME** and **PAYMOB_PASSWORD** instead of (or in addition to) **PAYMOB_API_KEY**.

## Callback URL

In your Paymob dashboard, set the **redirect URL** (or callback URL) after payment to:

```
https://your-domain.com/api/checkout/paymob/callback
```

Paymob will redirect the user there with query params such as `id` (order_id) and `success`. Our callback route uses these to mark the payment and upgrade the vendor tier.

## Flow

1. Vendor goes to **Dashboard → Upgrade** (or **Settings → Upgrade with Paymob**).
2. Chooses Tier 1 or Tier 2 and clicks **Pay with Paymob**.
3. App creates a PENDING Payment, calls Paymob to create order and get payment key, then redirects the user to Paymob’s iframe/checkout.
4. User pays on Paymob.
5. Paymob redirects to `/api/checkout/paymob/callback?id=...&success=...`.
6. Callback marks the payment SUCCESS and updates `Vendor.tier`, then redirects to **Settings** with `?upgrade=success`.
