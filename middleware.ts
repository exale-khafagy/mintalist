import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/dashboard(.*)",
  "/hub(.*)",
  "/home(.*)",
]);

const rawHost = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
  : "mintalist.com";
const MAIN_HOST = rawHost.startsWith("www.") ? rawHost.slice(4) : rawHost;

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per window
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) {
    return true;
  }
  entry.count++;
  return false;
}

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
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  // Rate limiting for API routes
  if (pathname.startsWith("/api")) {
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  // PAID_2 subdomain: vendor.mintalist.com → serve /[vendorSlug] with slug = "vendor"
  const subdomain = getSubdomain(host);
  if (subdomain && (pathname === "/" || pathname === "")) {
    const url = req.nextUrl.clone();
    url.pathname = `/${subdomain}`;
    return NextResponse.rewrite(url);
  }

  // Signed-in users visiting / get redirected to /home
  if (pathname === "/" || pathname === "") {
    const { userId } = await auth();
    if (userId) {
      const url = req.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
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
