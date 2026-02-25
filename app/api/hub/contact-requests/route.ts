import { NextResponse } from "next/server";
import { isHubAdmin } from "@/lib/hub-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET: List contact requests (Gold signups + Upgrade clicks) for Hub.
 */
export async function GET() {
  const allowed = await isHubAdmin();
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requests = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}
