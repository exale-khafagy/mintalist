import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { ExternalLink } from "lucide-react";

import { getCurrentVendor } from "@/lib/auth";
import { getVendorPublicUrl } from "@/lib/urls";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const vendor = await getCurrentVendor();
  if (!vendor) redirect("/onboarding");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mintalist.com";
  const publicUrl = getVendorPublicUrl(vendor.slug, vendor.tier, baseUrl);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-56 border-r border-border bg-card shadow-sm md:block">
        <DashboardSidebar />
      </aside>
      <main className="flex min-h-screen flex-1 flex-col pl-0 md:pl-56">
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-card/80 md:px-8 md:py-4">
          <p className="truncate text-sm text-muted-foreground">
            Logged in as <span className="font-medium text-foreground">{vendor.name}</span>
          </p>
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <ThemeToggle />
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 md:gap-2 md:px-3 md:text-sm"
            >
              <span className="sm:hidden">Shop</span>
              <span className="hidden sm:inline">View your shop</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        <div className="flex-1 p-4 pb-24 md:p-8 md:pb-8">
          <Breadcrumbs />
          {children}
        </div>
      </main>
      <DashboardMobileNav />
    </div>
  );
}
