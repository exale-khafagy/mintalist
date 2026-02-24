import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/dashboard(.*)",
  "/hub(.*)",
]);

const MAIN_HOST = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
  : "mintalist.com";

function getSubdomain(host: string): string | null {
  const base = MAIN_HOST;
  if (!host.endsWith(base) || host === base) return null;
  const prefix = host.slice(0, -base.length - 1);
  if (prefix.includes(".") || prefix === "www") return null;
  return prefix || null;
}

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get("host") ?? req.nextUrl.hostname;
  const pathname = req.nextUrl.pathname;

  // PAID_2 subdomain: vendor.mintalist.com → serve /[vendorSlug] with slug = "vendor"
  const subdomain = getSubdomain(host);
  if (subdomain && (pathname === "/" || pathname === "")) {
    const url = req.nextUrl.clone();
    url.pathname = `/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  if (!isProtectedRoute(req)) return;
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
