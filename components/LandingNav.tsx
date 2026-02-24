"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Header nav for landing: desktop inline nav, mobile hamburger + drawer with large touch targets.
 */
export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <>
      <ThemeToggle />
      <Link
        href="/sign-in"
        className="min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex sm:min-w-0 sm:px-3"
      >
        Sign in
      </Link>
      <Link
        href="/sign-up"
        className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
      >
        Get started
      </Link>
    </>
  );

  return (
    <>
      {/* Desktop nav: visible from sm up */}
      <nav className="hidden items-center gap-1 sm:flex sm:gap-3" aria-label="Main">
        {navLinks}
      </nav>

      {/* Mobile: hamburger + drawer */}
      <div className="flex items-center sm:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 sm:hidden"
          aria-hidden
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-border bg-card shadow-xl"
            style={{ zIndex: 1 }}
          >
            <div className="flex min-h-14 items-center justify-between border-b border-border px-4">
              <span className="font-semibold text-foreground">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <div className="flex min-h-[48px] items-center gap-3 rounded-lg px-3">
                <ThemeToggle />
                <span className="text-sm text-muted-foreground">Theme</span>
              </div>
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[48px] items-center rounded-lg px-4 text-sm font-medium text-foreground hover:bg-muted"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex min-h-[48px] items-center justify-center rounded-full bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
