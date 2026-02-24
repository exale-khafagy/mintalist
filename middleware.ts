import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/dashboard(.*)",
  "/hub(.*)",
]);

const rawHost = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
  : "mintalist.com";
const MAIN_HOST = rawHost.startsWith("www.") ? rawHost.slice(4) : rawHost;

function getSubdomain(host: string): string | null {
  const normalized = host.startsWith("www.") ? host.slice(4) : host;
  if (!normalized.endsWith(MAIN_HOST) || normalized === MAIN_HOST) return null;
  const prefix = normalized.slice(0, -MAIN_HOST.length - 1);
  if (prefix.includes(".")) return null;
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
