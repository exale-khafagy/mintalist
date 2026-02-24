/**
 * Paymob Accept API helpers.
 * Docs: https://accept.paymobsolutions.com / https://developers.paymob.com
 * Env: PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_IFRAME_ID (optional)
 */

const PAYMOB_BASE = "https://accept.paymobsolutions.com/api";

export type Tier = "PAID_1" | "PAID_2";
export type BillingPeriod = "MONTHLY" | "ANNUAL";

/**
 * Base pricing (amounts in cents, EGP):
 * - Gold (PAID_1):   100 LE / month, 600 LE / year (first year).
 * - Platinum (PAID_2): 150 LE / month, 900 LE / year (first year).
 *
 * Renewal pricing can be adjusted later via env overrides or code changes.
 */
const GOLD_MONTHLY_CENTS = 10_000; // 100 EGP
const GOLD_ANNUAL_CENTS = 60_000; // 600 EGP
const PLATINUM_MONTHLY_CENTS = 15_000; // 150 EGP
const PLATINUM_ANNUAL_CENTS = 90_000; // 900 EGP

function getConfig() {
  const apiKey = process.env.PAYMOB_API_KEY;
  const integrationId = process.env.PAYMOB_INTEGRATION_ID;
  const iframeId = process.env.PAYMOB_IFRAME_ID;
  if (!apiKey || !integrationId) {
    throw new Error("Missing PAYMOB_API_KEY or PAYMOB_INTEGRATION_ID");
  }
  return {
    apiKey,
    integrationId: parseInt(integrationId, 10),
    iframeId: iframeId ?? "iframe_id", // Paymob dashboard gives you an iframe id
  };
}

export async function getAuthToken(): Promise<string> {
  const { apiKey } = getConfig();
  // Paymob Accept: some accounts use api_key, others username/password. Use PAYMOB_USERNAME + PAYMOB_PASSWORD if auth fails.
  const body = process.env.PAYMOB_USERNAME
    ? { username: process.env.PAYMOB_USERNAME, password: process.env.PAYMOB_PASSWORD }
    : { api_key: apiKey };
  const res = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paymob auth failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("Paymob auth: no token in response");
  return data.token;
}

export async function createOrder(
  token: string,
  opts: {
    amountCents: number;
    currency?: string;
    merchantOrderId: string;
  }
): Promise<number> {
  const res = await fetch(`${PAYMOB_BASE}/ecommerce/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount_cents: opts.amountCents,
      currency: opts.currency ?? "EGP",
      merchant_order_id: opts.merchantOrderId,
      delivery_needed: "false",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paymob create order failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { id?: number };
  if (data.id == null) throw new Error("Paymob create order: no id in response");
  return data.id;
}

export async function getPaymentKey(
  token: string,
  opts: {
    amountCents: number;
    currency?: string;
    orderId: number;
    billingData: {
      first_name: string;
      last_name: string;
      email: string;
      phone_number: string;
    };
  }
): Promise<string> {
  const { integrationId } = getConfig();
  const res = await fetch(`${PAYMOB_BASE}/acceptance/payment_keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount_cents: opts.amountCents,
      currency: opts.currency ?? "EGP",
      order_id: opts.orderId,
      integration_id: integrationId,
      billing_data: opts.billingData,
      expiration: 3600,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paymob payment key failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("Paymob payment key: no token in response");
  return data.token;
}

export function getRedirectUrl(paymentKey: string): string {
  const { iframeId } = getConfig();
  return `${PAYMOB_BASE.replace("/api", "")}/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
}

export function getAmountCents(tier: Tier, period: BillingPeriod = "MONTHLY"): number {
  const monthlyEnv = process.env.PAYMOB_MONTHLY_CENTS;
  const annualEnv = process.env.PAYMOB_ANNUAL_CENTS;
  if (period === "ANNUAL" && annualEnv) return parseInt(annualEnv, 10);
  if (period === "MONTHLY" && monthlyEnv) return parseInt(monthlyEnv, 10);

  const isAnnual = period === "ANNUAL";
  if (tier === "PAID_1") {
    return isAnnual ? GOLD_ANNUAL_CENTS : GOLD_MONTHLY_CENTS;
  }
  return isAnnual ? PLATINUM_ANNUAL_CENTS : PLATINUM_MONTHLY_CENTS;
}
