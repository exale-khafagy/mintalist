import { NextResponse } from "next/server";
import { isHubAdmin } from "@/lib/hub-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function PATCH(req: Request, context: { params: Params }) {
  const allowed = await isHubAdmin();
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params;
  let body: { tier?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const tier = body.tier;
  if (!tier || !["FREE", "PAID_1", "PAID_2"].includes(tier)) {
    return NextResponse.json({ error: "tier must be FREE, PAID_1, or PAID_2" }, { status: 400 });
  }

  try {
    await prisma.vendor.update({
      where: { id },
      data: { tier: tier as "FREE" | "PAID_1" | "PAID_2" },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update vendor" }, { status: 500 });
  }
}
