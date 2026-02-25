import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to redeem a code." }, { status: 401 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const vendor = await prisma.vendor.findUnique({
    where: { clerkUserId: userId },
  });
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const code = body.code.trim().toUpperCase();
  const voucher = await prisma.voucher.findUnique({
    where: { code },
  });

  if (!voucher) {
    return NextResponse.json(
      { error: "Invalid or unknown voucher code." },
      { status: 404 }
    );
  }

  if (voucher.redeemedAt) {
    return NextResponse.json(
      { error: "This voucher has already been redeemed." },
      { status: 409 }
    );
  }

  if (voucher.expiresAt && voucher.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This voucher has expired." },
      { status: 410 }
    );
  }

  await prisma.$transaction([
    prisma.voucher.update({
      where: { id: voucher.id },
      data: {
        redeemedAt: new Date(),
        redeemedByVendorId: vendor.id,
      },
    }),
    prisma.vendor.update({
      where: { id: vendor.id },
      data: { tier: voucher.tier },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    tier: voucher.tier,
    message: voucher.tier === "FREE" ? "You're on Silver (Free)." : "You're now on Gold.",
  });
}
