"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  User,
  Link2,
  MapPin,
  QrCode,
  CreditCard,
  Settings,
  Menu,
  X,
} from "lucide-react";

const MAIN_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/links", label: "Links", icon: Link2 },
] as const;

const MORE_LINKS = [
  { href: "/dashboard/location", label: "Location", icon: MapPin },
  { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
  { href: "/dashboard/checkout", label: "Upgrade", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardMobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] pt-2 md:hidden">
        {MAIN_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              isActive(href) ? "text-emerald-600" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
            MORE_LINKS.some((l) => isActive(l.href)) ? "text-emerald-600" : "text-muted-foreground"
          }`}
        >
          <Menu className="h-5 w-5" />
          <span>More</span>
        </button>
      </nav>

      {/* More drawer overlay */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMoreOpen(false)}
            aria-hidden
          />
          <div className="fixed bottom-0 left-0 right-0 z-40 max-h-[70vh] overflow-auto rounded-t-2xl border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-medium text-foreground">More</span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col p-2">
              {MORE_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive(href)
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
