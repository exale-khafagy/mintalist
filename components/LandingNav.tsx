"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useUser, UserButton } from "@clerk/nextjs";

import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Header nav for landing: desktop inline nav, mobile hamburger + drawer.
 * When signed in: show user name + Dashboard. When signed out: Sign in + Get started.
 */
export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoaded } = useUser();

  const displayName =
    user?.firstName ?? user?.fullName ?? user?.primaryEmailAddress?.emailAddress?.split("@")[0] ?? "Account";

  const signedInNav = (
    <>
      <ThemeToggle />
      <Link
        href="/dashboard"
        className="min-h-[44px] shrink-0 items-center justify-center rounded-full text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex sm:px-3"
      >
        <span className="truncate max-w-[120px] sm:max-w-[180px]" title={displayName}>
          {displayName}
        </span>
        <span className="ml-1 hidden sm:inline">· Dashboard</span>
      </Link>
      <div className="flex min-h-[44px] min-w-[44px] items-center justify-center">
        <UserButton afterSignOutUrl="/" />
      </div>
    </>
  );

  const signedOutNav = (
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

  const navContent = isLoaded && user ? signedInNav : signedOutNav;

  return (
    <>
      {/* Desktop nav: visible from sm up */}
      <nav className="hidden items-center gap-1 sm:flex sm:gap-3" aria-label="Main">
        {navContent}
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
        <div className="fixed inset-0 z-40 sm:hidden" aria-hidden>
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <div
            className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col border-l border-border bg-white shadow-xl dark:bg-zinc-900"
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
              {isLoaded && user ? (
                <>
                  <div className="flex min-h-[48px] items-center gap-3 rounded-lg px-3">
                    <span className="text-sm font-medium text-foreground truncate">{displayName}</span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex min-h-[48px] items-center rounded-lg px-4 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
