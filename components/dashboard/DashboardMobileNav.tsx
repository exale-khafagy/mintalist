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
  Settings,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

const ALL_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/links", label: "Links", icon: Link2 },
  { href: "/dashboard/location", label: "Location", icon: MapPin },
  { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
  { href: "/dashboard/checkout", label: "Get Gold", icon: Sparkles },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardMobileNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="fixed bottom-4 right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Full slide-out menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="fixed bottom-0 left-0 right-0 top-0 z-40 flex flex-col bg-white dark:bg-zinc-900 md:hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-medium text-foreground">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col p-2">
              {ALL_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
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
