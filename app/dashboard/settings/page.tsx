import Link from "next/link";
import { getCurrentVendor } from "@/lib/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { DowngradeSection } from "./DowngradeSection";
import { VoucherRedeem } from "./VoucherRedeem";
import { SettingsAlerts } from "./SettingsAlerts";

export default async function DashboardSettingsPage() {
  const vendor = await getCurrentVendor();
  if (!vendor) return null;

  const tierLabel = vendor.tier === "FREE" ? "Silver" : "Gold";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SettingsAlerts />
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Settings</h1>
        <p className="text-muted-foreground">
          Your plan and voucher redemption. Use a promo code from our team to upgrade.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>
            You are on the <span className="font-medium text-foreground">{tierLabel}</span> tier
            {vendor.tier !== "FREE" && (
              <span className="ml-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {vendor.tier}
              </span>
            )}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {vendor.tier === "FREE"
              ? "Redeem a voucher code below to upgrade. Our team will send you a code when you're ready."
              : "You have an upgraded plan. Redeem another voucher below if you have one."}
          </p>
        </CardContent>
      </Card>

      {vendor.tier === "GOLD" && <DowngradeSection tier={vendor.tier} />}

      <Card>
        <CardHeader>
          <CardTitle>Redeem voucher</CardTitle>
          <CardDescription>
            Have a voucher code? Enter it here to upgrade your account. Codes are case-insensitive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VoucherRedeem />
        </CardContent>
      </Card>
    </div>
  );
}
