import Link from "next/link";

import { ExaleFooter } from "@/components/ExaleFooter";
import { LandingBackground } from "@/components/LandingBackground";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingNav } from "@/components/LandingNav";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <LandingBackground />
      <header
        className="fixed top-0 left-0 right-0 z-30 h-14 border-b border-border bg-card/95 px-3 backdrop-blur sm:h-16 sm:px-4"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between">
          <LandingHeader />
          <LandingNav />
        </div>
      </header>

      <main className="relative z-0 flex flex-1 items-center overflow-x-hidden px-4 pb-16 sm:pb-20" style={{ paddingTop: "calc(6rem + env(safe-area-inset-top, 0px))" }}>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 md:flex-row md:items-center">
          <section className="flex-1 text-center md:text-left">
            <p className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
              Like Linktree, but built for restaurants and cafes.
            </p>
            <h1 className="mt-4 max-w-xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Turn one link into your entire menu experience.
            </h1>
            <p className="mt-3 max-w-lg text-base text-muted-foreground sm:mt-4 sm:text-lg">
              Share a single link or QR code. Guests see your digital menu, photos, socials, and contact details
              — all in a fast, mobile‑first page.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:items-stretch sm:gap-4 md:items-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700"
              >
                Create your menu
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card/80 px-8 py-3 text-base font-medium text-foreground hover:bg-accent"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
              No app to install, no design skills needed. Just your menu, ready in minutes.
            </p>
          </section>

          <section className="min-w-0 flex-1">
            <div className="mx-auto w-full max-w-md rounded-3xl bg-card/90 p-5 shadow-lg ring-1 ring-border/60 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Live example
                  </p>
                  <p className="text-lg font-semibold text-foreground">Cairo Coffee House</p>
                  <p className="text-xs text-muted-foreground">mintalist.com/cairo-coffee</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-[0.7rem] font-medium text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/40">
                  QR
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Breakfast Combo</p>
                    <p className="text-xs text-muted-foreground">Eggs, toast, coffee</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">85 LE</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Iced Latte</p>
                    <p className="text-xs text-muted-foreground">Oat / regular milk</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">65 LE</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Mint Lemonade</p>
                    <p className="text-xs text-muted-foreground">House special</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">55 LE</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                <span>Links to Instagram, WhatsApp, Maps & more.</span>
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[0.65rem] font-medium text-white">
                  Silver is free
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <ExaleFooter />
    </div>
  );
}
