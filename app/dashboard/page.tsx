import Link from "next/link";
import { getCurrentVendor } from "@/lib/auth";
import { getVendorPublicUrl } from "@/lib/urls";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardTour } from "@/components/DashboardTour";

const TIER_LABELS: Record<string, string> = {
  FREE: "Silver",
  GOLD: "Gold",
};

export default async function DashboardOverviewPage() {
  const vendor = await getCurrentVendor();
  if (!vendor) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mintalist.com";
  const publicUrl = getVendorPublicUrl(vendor.slug, baseUrl);

  const hasLogo = !!vendor.logoUrl;
  const hasMenuItems = vendor.menuItems.length > 0;
  const hasLocation =
    !!(vendor.locationName || vendor.address || vendor.phone);
  const incomplete = !hasLogo || !hasMenuItems || !hasLocation;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <DashboardTour />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Overview</h1>
          <p className="text-muted-foreground">
            Your digital menu and profile at a glance.
          </p>
        </header>
        <span
          className={
            vendor.tier === "FREE"
              ? "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
              : "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
          }
        >
          {TIER_LABELS[vendor.tier] ?? vendor.tier}
        </span>
      </div>

      {incomplete && (
        <Card className="border-amber-200 bg-amber-50/70 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="text-base">Complete your profile</CardTitle>
            <CardDescription>
              Add these to make your public page more useful for customers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!hasLogo && (
              <p className="text-sm text-foreground">
                • Add a logo in{" "}
                <Link href="/dashboard/profile" className="font-medium text-emerald-600 hover:underline">
                  Profile
                </Link>
              </p>
            )}
            {!hasMenuItems && (
              <p className="text-sm text-foreground">
                • Add menu items in{" "}
                <Link href="/dashboard/menu" className="font-medium text-emerald-600 hover:underline">
                  Menu
                </Link>
              </p>
            )}
            {!hasLocation && (
              <p className="text-sm text-foreground">
                • Add location & contact in{" "}
                <Link href="/dashboard/location" className="font-medium text-emerald-600 hover:underline">
                  Location
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your public menu</CardTitle>
            <CardDescription>
              Share this link or get a QR code in the QR Code section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm font-medium text-emerald-600 hover:underline"
            >
              {publicUrl}
            </a>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/qr">Get QR code</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/profile">Edit profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menu items</CardTitle>
            <CardDescription>
              {vendor.menuItems.length} item{vendor.menuItems.length !== 1 ? "s" : ""} on your menu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/menu">Manage menu</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>
            You're on <span className="font-medium text-foreground">{TIER_LABELS[vendor.tier] ?? vendor.tier}</span>.
            {vendor.tier === "FREE" && " Upgrade for custom URL, background image, and no ads."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary" size="sm">
            <Link href="/dashboard/settings">Settings & upgrade</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
