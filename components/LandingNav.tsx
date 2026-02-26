"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useUser, UserButton, useClerk, SignOutButton } from "@clerk/nextjs";

import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Header nav for landing: desktop inline nav, mobile hamburger + drawer.
 * When signed in: show user name + Dashboard. When signed out: Sign in + Get started.
 */
export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const { openUserProfile } = useClerk();

  const displayName =
    user?.firstName ?? user?.fullName ?? user?.primaryEmailAddress?.emailAddress?.split("@")[0] ?? "Account";

  const signedInNav = (
    <>
      <ThemeToggle />
      <Link
        href="/dashboard"
        className="min-h-[44px] shrink-0 items-center justify-center rounded-full text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex sm:px-3"
      >
        <span className="max-w-[120px] truncate sm:max-w-[180px]" title={displayName}>
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
        <div className="fixed left-0 top-0 z-50 h-[100dvh] w-full sm:hidden" aria-hidden>
          {/* Dark blurred background overlay */}
          <button
            type="button"
            className="absolute left-0 top-0 h-full w-full bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          {/* Main solid background drawer */}
          <div className="absolute right-0 top-0 flex h-full w-full max-w-[280px] flex-col border-l border-border bg-background shadow-2xl">
            <div className="flex min-h-[3.5rem] items-center justify-between border-b border-border px-5">
              <span className="font-semibold text-foreground">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] min-w-[44px] -mr-3 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Nav content list */}
            <div className="flex flex-1 flex-col overflow-y-auto p-5">
              
              <div className="flex flex-col gap-2">
                {isLoaded && user ? (
                  <>
                    {/* Programmatic User Profile Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        openUserProfile();
                      }}
                      className="mb-2 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border/50 bg-muted/40 p-3 text-left transition-colors hover:bg-muted/60"
                    >
                      <img
                        src={user?.imageUrl}
                        alt={displayName}
                        className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm"
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-semibold text-foreground">{displayName}</span>
                        <span className="text-xs text-muted-foreground">Manage account</span>
                      </div>
                    </button>
                    
                    {/* Dashboard Link */}
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      Dashboard
                    </Link>

                    {/* Sign Out Button */}
                    <SignOutButton>
                      <button 
                        onClick={() => setMobileOpen(false)}
                        className="flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                      >
                        Sign out
                      </button>
                    </SignOutButton>

                    {/* Theme Toggle */}
                    <div className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-muted/50">
                      <span className="text-sm font-medium text-foreground">Theme</span>
                      <ThemeToggle />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Logged Out Actions */}
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="flex w-full items-center justify-center rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileOpen(false)}
                      className="mt-2 flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
                    >
                      Get started
                    </Link>

                    {/* Theme Toggle (Logged Out) */}
                    <div className="mt-4 flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-muted/50">
                      <span className="text-sm font-medium text-foreground">Theme</span>
                      <ThemeToggle />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}