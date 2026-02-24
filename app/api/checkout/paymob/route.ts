import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getAuthToken,
  createOrder,
  getPaymentKey,
  getRedirectUrl,
  getAmountCents,
  type Tier,
  type BillingPeriod,
} from "@/lib/paymob";

const bodySchema = z.object({
  tier: z.enum(["PAID_1", "PAID_2"]),
  period: z.enum(["MONTHLY", "ANNUAL"]).optional(),
});

export async function POST(req: Request) {
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

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body: tier must be PAID_1 or PAID_2" }, { status: 400 });
  }

  const tier = body.tier as Tier;
  const period = (body.period ?? "MONTHLY") as BillingPeriod;
  const amountCents = getAmountCents(tier, period);

  const payment = await prisma.payment.create({
    data: {
      vendorId: vendor.id,
      tier,
      billingPeriod: period as "MONTHLY" | "ANNUAL",
      amountCents,
      currency: "EGP",
      status: "PENDING",
    },
  });

  try {
    const token = await getAuthToken();
    const orderId = await createOrder(token, {
      amountCents,
      currency: "EGP",
      merchantOrderId: payment.id,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { paymobOrderId: String(orderId) },
    });

    const paymentKey = await getPaymentKey(token, {
      amountCents,
      currency: "EGP",
      orderId,
      billingData: {
        first_name: vendor.name.split(" ")[0] || "Vendor",
        last_name: vendor.name.split(" ").slice(1).join(" ") || "Mintalist",
        email: "vendor@mintalist.com",
        phone_number: vendor.phone || "0000000000",
      },
    });

    const redirectUrl = getRedirectUrl(paymentKey);
    return NextResponse.json({ redirectUrl, paymentId: payment.id });
  } catch (err) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    console.error("Paymob checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment setup failed" },
      { status: 502 }
    );
  }
}
