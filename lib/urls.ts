export type Tier = "FREE" | "GOLD";

/**
 * Build the public URL for a vendor (path-based: mintalist.com/slug).
 */
export function getVendorPublicUrl(slug: string, baseUrl: string): string {
  const trimmedBase = baseUrl.replace(/\/$/, "");
  let origin: string;
  try {
    const url = new URL(trimmedBase);
    origin = url.origin;
  } catch {
    origin = trimmedBase;
  }
  return `${origin}/${slug}`;
}
