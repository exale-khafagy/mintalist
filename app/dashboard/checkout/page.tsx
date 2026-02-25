import Link from "next/link";
import { getCurrentVendor } from "@/lib/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardCheckoutPage() {
  const vendor = await getCurrentVendor();
  if (!vendor) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Upgrade
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Upgrades are via promo codes. Our team will contact you with a code when you're ready.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Get Gold or Platinum</CardTitle>
          <CardDescription>
            Join Free always, try Gold for 1 month, or try Platinum for 2 weeks. Our team will send you a promo code to redeem in Settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Redeem voucher in Settings →
          </Link>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        <Link
          href="/dashboard/settings"
          className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          ← Back to Settings
        </Link>
      </p>
    </div>
  );
}
