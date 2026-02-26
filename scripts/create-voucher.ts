/**
 * Create a voucher code (for admin use).
 * Run: npx tsx scripts/create-voucher.ts <CODE> <TIER> [expiresInDays]
 * TIER: GOLD (Gold) or FREE (Silver). Example: npx tsx scripts/create-voucher.ts SUMMER2025 GOLD 30
 */
import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const code = process.argv[2]?.trim().toUpperCase();
const tier = process.argv[3]?.toUpperCase();
const expiresInDays = process.argv[4] ? parseInt(process.argv[4], 10) : undefined;

if (!code || !tier) {
  console.error("Usage: npx tsx scripts/create-voucher.ts <CODE> <TIER> [expiresInDays]");
  console.error("Example: npx tsx scripts/create-voucher.ts SUMMER2025 GOLD");
  process.exit(1);
}

if (tier !== "GOLD" && tier !== "FREE") {
  console.error("TIER must be GOLD (Gold) or FREE (Silver)");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const expiresAt =
    expiresInDays != null && !Number.isNaN(expiresInDays)
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

  const voucher = await prisma.voucher.create({
    data: {
      code,
      tier: tier as "GOLD" | "FREE",
      expiresAt,
    },
  });

  console.log("Created voucher:", voucher.code, "→", voucher.tier, expiresAt ? `(expires ${expiresAt.toISOString()})` : "(no expiry)");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
