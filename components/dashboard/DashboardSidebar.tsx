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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/links", label: "Links", icon: Link2 },
  { href: "/dashboard/location", label: "Location", icon: MapPin },
  { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link
          href="/dashboard"
          className={`font-semibold tracking-tight text-foreground transition hover:text-emerald-600 dark:hover:text-emerald-400 ${
            collapsed ? "hidden" : ""
          }`}
        >
          Mintalist
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
