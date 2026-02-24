import Link from "next/link";
import { getCurrentVendor } from "@/lib/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { CheckoutForm } from "./CheckoutForm";

export default async function DashboardCheckoutPage() {
  const vendor = await getCurrentVendor();
  if (!vendor) return null;

  if (vendor.tier !== "FREE") {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <p className="rounded-lg border border-border bg-card p-4 text-muted-foreground">
          You are already on <span className="font-medium text-foreground">{vendor.tier}</span>.{" "}
          <Link href="/dashboard/settings" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
            Back to Settings
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Upgrade
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Choose a plan and pay securely with Paymob. Custom URL, no ads, and more.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Gold</CardTitle>
            <CardDescription className="text-base">
              Custom URL, background image, no ads. Monthly or annual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 px-4 py-3">
              <p className="text-2xl font-bold tabular-nums text-foreground">
                100 <span className="text-sm font-normal text-muted-foreground">LE / month</span>
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">or 1000 LE / year (save more)</p>
            </div>
            <CheckoutForm tier="PAID_1" />
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 transition-shadow hover:shadow-md dark:border-emerald-400/20">
          <CardHeader className="pb-2">
            <span className="mb-1 inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-400">
              Best value
            </span>
            <CardTitle className="text-xl">Platinum</CardTitle>
            <CardDescription className="text-base">
              Everything in Gold + your own subdomain (yourcafe.mintalist.com).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 px-4 py-3">
              <p className="text-2xl font-bold tabular-nums text-foreground">
                100 <span className="text-sm font-normal text-muted-foreground">LE / month</span>
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">or 1000 LE / year (save more)</p>
            </div>
            <CheckoutForm tier="PAID_2" />
          </CardContent>
        </Card>
      </div>

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
