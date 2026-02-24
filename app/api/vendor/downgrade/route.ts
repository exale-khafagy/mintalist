import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomSlug } from "@/lib/slug";

/**
 * POST /api/vendor/downgrade
 * Downgrade the current vendor to Silver (FREE).
 * Only allowed when tier is PAID_1 or PAID_2.
 * Sets tier to FREE, assigns a new random slug (custom URL is lost), and clears background image.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({
    where: { clerkUserId: userId },
  });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  if (vendor.tier !== "PAID_1" && vendor.tier !== "PAID_2") {
    return NextResponse.json(
      { error: "You are already on Silver. No downgrade needed." },
      { status: 400 }
    );
  }

  let newSlug = randomSlug(8);
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    const existing = await prisma.vendor.findUnique({ where: { slug: newSlug } });
    if (!existing) break;
    newSlug = randomSlug(8);
    attempts++;
  }
  if (attempts >= maxAttempts) {
    newSlug = `${newSlug}-${Date.now().toString(36).slice(-4)}`;
  }

  await prisma.vendor.update({
    where: { clerkUserId: userId },
    data: {
      tier: "FREE",
      slug: newSlug,
      backgroundImageUrl: null,
    },
  });

  return NextResponse.json({ ok: true, tier: "FREE", slug: newSlug });
}
