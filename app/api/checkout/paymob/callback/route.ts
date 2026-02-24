import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Paymob redirects the user here after payment (GET with query params).
 * Params may include: id (order_id or transaction_id), success, hmac, amount_cents, etc.
 * If PAYMOB_HMAC_SECRET is set and Paymob sends hmac, we verify the callback.
 */
function verifyPaymobHmac(searchParams: URLSearchParams, secret: string): boolean {
  const received = searchParams.get("hmac");
  if (!received) return true; // no hmac sent → skip verification

  // Paymob Accept callback HMAC string order (documented in Paymob dashboard)
  const keys = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "order",
    "owner",
    "pending",
    "source_data_pan",
    "source_data_sub_type",
    "source_data_type",
    "success",
  ];
  const parts = keys.map((k) => searchParams.get(k) ?? "");
  const str = parts.join("");
  const expected = createHmac("sha256", secret).update(str).digest("hex");
  return expected === received.toLowerCase();
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const orderId = searchParams.get("id") ?? searchParams.get("order_id");
  const success = searchParams.get("success");
  const isSuccess = success === "true" || success === "1";

  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  if (hmacSecret && !verifyPaymobHmac(searchParams, hmacSecret)) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=hmac_invalid", req.url)
    );
  }

  if (!orderId) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=missing_params", req.url)
    );
  }

  const payment = await prisma.payment.findFirst({
    where: { paymobOrderId: orderId, status: "PENDING" },
    include: { vendor: true },
  });

  if (!payment) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=payment_not_found", req.url)
    );
  }

  if (!isSuccess) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=payment_failed", req.url)
    );
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        paymobTransactionId: searchParams.get("txn_id") ?? undefined,
      },
    }),
    prisma.vendor.update({
      where: { id: payment.vendorId },
      data: { tier: payment.tier },
    }),
  ]);

  return NextResponse.redirect(
    new URL("/dashboard/settings?upgrade=success", req.url)
  );
}
