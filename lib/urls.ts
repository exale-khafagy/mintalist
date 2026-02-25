/**
 * Derive the main host (without www) from a base URL.
 * Example: https://www.mintalist.com -> mintalist.com
 */
export function getMainHost(baseUrl: string): string {
  try {
    const url = new URL(baseUrl);
    const host = url.hostname;
    return host.startsWith("www.") ? host.slice(4) : host;
  } catch {
    const withoutProtocol = baseUrl.replace(/^https?:\/\//, "").split("/")[0];
    return withoutProtocol.startsWith("www.")
      ? withoutProtocol.slice(4)
      : withoutProtocol;
  }
}

export type Tier = "FREE" | "PAID_1" | "PAID_2";

/**
 * Build the public URL for a vendor based on their tier.
 * - FREE / PAID_1: path-based, e.g. https://mintalist.com/slug
 * - PAID_2 (Platinum): subdomain, e.g. https://slug.mintalist.com
 */
export function getVendorPublicUrl(
  slug: string,
  tier: Tier,
  baseUrl: string
): string {
  const trimmedBase = baseUrl.replace(/\/$/, "");

  let origin: string;
  try {
    const url = new URL(trimmedBase);
    origin = url.origin;
  } catch {
    origin = trimmedBase;
  }

  if (tier === "PAID_2") {
    const mainHost = getMainHost(trimmedBase);
    // Default to https if protocol is missing
    const protocolMatch = origin.match(/^(https?:)\/\//);
    const protocol = protocolMatch ? protocolMatch[1] : "https:";
    return `${protocol}//${slug}.${mainHost}`;
  }

  return `${origin}/${slug}`;
}

