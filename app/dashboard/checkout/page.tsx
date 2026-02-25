import Link from "next/link";
import { getCurrentVendor } from "@/lib/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestContactButton } from "./RequestContactButton";

type Props = { searchParams: Promise<{ requested?: string }> };

export default async function DashboardCheckoutPage({ searchParams }: Props) {
  const vendor = await getCurrentVendor();
  if (!vendor) return null;

  const { requested } = await searchParams;
  const showRequestedMessage = requested === "1";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {showRequestedMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          Someone will contact you within 24 hours.
        </div>
      )}

      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Get Gold
        </h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Sign up is free. New Gold accounts get one month free—we’ll contact you to get started. Or pay us directly and redeem a promo code in Settings.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Gold pricing</CardTitle>
          <CardDescription>
            75 LE/month for the first 3 months, or 800 LE for the first year. Renewal: 100 LE/month or 1000 LE/year. New Gold signups get one month free; we’ll reach out to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <RequestContactButton />
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Redeem promo code in Settings →
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
