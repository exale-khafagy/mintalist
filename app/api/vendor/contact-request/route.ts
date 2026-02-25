import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * POST: Create a contact request (user clicked "Upgrade" / "Get Gold" in dashboard).
 * Hub is notified; user sees "Someone will contact you within 24 hours."
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { clerkUserId: userId },
  });
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const user = await currentUser();
  const vendorEmail =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "";

  await prisma.contactRequest.create({
    data: {
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorEmail: vendorEmail || "unknown",
      vendorPhone: vendor.phone ?? null,
      source: "UPGRADE_CLICK",
    },
  });

  return NextResponse.json({ ok: true });
}
