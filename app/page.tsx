import Link from "next/link";

import { ExaleFooter } from "@/components/ExaleFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="fixed top-0 left-0 right-0 z-10 h-14 border-b border-border bg-card px-3 sm:h-16 sm:px-4">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between">
          <LandingHeader />
          <nav className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link
              href="/sign-in"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 sm:px-4 sm:py-2"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-24 pb-16 text-center sm:pt-20 sm:pb-20">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl sm:text-5xl">
          Your menu. One link.
        </h1>
        <p className="mt-3 max-w-xl text-base text-muted-foreground sm:mt-4 sm:text-lg">
          Like Linktree for restaurants and cafes. Share one link or QR code —
          customers get your digital menu, socials, and contact.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <Link
            href="/sign-up"
            className="rounded-full bg-emerald-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            Create your menu
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full border border-zinc-300 bg-white px-8 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Sign in
          </Link>
        </div>
      </main>

      <ExaleFooter />
    </div>
  );
}
