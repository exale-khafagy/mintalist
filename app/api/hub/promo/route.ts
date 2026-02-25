import { NextResponse } from "next/server";
import { isHubAdmin } from "@/lib/hub-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const allowed = await isHubAdmin();
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { code?: string; tier?: string; expiresInDays?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const code = body.code?.trim().toUpperCase();
  const tier = body.tier;
  if (!code || !tier || !["FREE", "PAID_1", "PAID_2"].includes(tier)) {
    return NextResponse.json(
      { error: "code and tier (FREE, PAID_1, or PAID_2) required" },
      { status: 400 }
    );
  }

  const expiresAt =
    body.expiresInDays != null && body.expiresInDays > 0
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

  try {
    const voucher = await prisma.voucher.create({
      data: {
        code,
        tier: tier as "FREE" | "PAID_1" | "PAID_2",
        expiresAt,
      },
    });
    return NextResponse.json({
      ok: true,
      code: voucher.code,
      tier: voucher.tier,
      expiresAt: voucher.expiresAt?.toISOString() ?? null,
    });
  } catch (e: unknown) {
    const msg = e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002"
      ? "That code already exists"
      : "Failed to create voucher";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
