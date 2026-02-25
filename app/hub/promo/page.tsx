import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HubPromoForm } from "./HubPromoForm";

export const dynamic = "force-dynamic";

export default async function HubPromoPage() {
  const vouchers = await prisma.voucher.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Promo codes</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Generate voucher codes for promotions. Vendors redeem them in Settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create voucher</CardTitle>
            <CardDescription>
              Code is case-insensitive. Optional expiry in days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HubPromoForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing vouchers</CardTitle>
            <CardDescription>
              {vouchers.length} voucher{vouchers.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vouchers.length === 0 ? (
              <p className="text-sm text-zinc-600">No vouchers yet.</p>
            ) : (
              <div className="space-y-2">
                {vouchers.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded border p-2">
                    <div>
                      <p className="font-mono text-sm">{v.code}</p>
                      <p className="text-xs text-zinc-600">
                        {v.tier} • Expires {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : "Never"}
                        {v.redeemedAt && " • Redeemed"}
                      </p>
                    </div>
                    <button className="text-sm text-red-600 hover:underline">Delete</button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
