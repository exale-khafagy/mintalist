import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { ExaleFooter } from "@/components/ExaleFooter";
import { LandingBackground } from "@/components/LandingBackground";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingNav } from "@/components/LandingNav";

export default async function HomeSignedInPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

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

      <main
        className="relative z-0 flex flex-1 flex-col items-center justify-center px-4 pb-16 sm:pb-20"
        style={{ paddingTop: "calc(6rem + env(safe-area-inset-top, 0px))" }}
      >
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Manage your digital menu and profile from your dashboard.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              Open Dashboard
            </Link>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card/80 px-8 py-3 text-base font-medium text-foreground hover:bg-accent"
            >
              Edit profile
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            <Link href="/dashboard/settings" className="underline hover:text-foreground">
              Settings & upgrade
            </Link>
            {" · "}
            <Link href="/dashboard/qr" className="underline hover:text-foreground">
              Get QR code
            </Link>
          </p>
        </div>
      </main>

      <ExaleFooter />
    </div>
  );
}
