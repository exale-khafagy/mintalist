import { randomBytes } from "node:crypto";

/**
 * Generate a short random slug for free-tier vendors (e.g. mintalist.com/xy7k2m9a).
 * Uses lowercase alphanumeric. Safe for server-side only (Node).
 */
export function randomSlug(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) result += chars[bytes[i]! % chars.length];
  return result;
}
