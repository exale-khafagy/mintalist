import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { isHubAdmin } from "@/lib/hub-auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let allowed = false;
  try {
    allowed = await isHubAdmin();
  } catch (e) {
    console.error("Hub isHubAdmin error:", e);
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4">
        <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-zinc-900">Hub access</h1>
          <p className="mt-2 text-sm text-zinc-600">
            You don’t have access to the Hub. Sign in with an account that’s listed in <strong>HUB_ADMIN_EMAILS</strong> (or <strong>HUB_ADMIN_USER_IDS</strong>) in the project’s environment variables.
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            If you’re the owner, add your email in Vercel → Project → Settings → Environment Variables, then redeploy.
          </p>
          <div className="mt-6 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-emerald-600 hover:underline"
            >
              ← Back to app
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/hub" className="font-semibold text-zinc-900">
            Hub · Mintalist
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/hub" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Vendors
            </Link>
            <Link href="/hub/promo" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Promo codes
            </Link>
            <Link href="/hub/visit" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Vendor visit
            </Link>
            <Link href="/hub/contacts" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Contacts
            </Link>
            <Link href="/hub/ad-clicks" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
              Ad clicks
            </Link>
            <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
              Back to app
            </Link>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Breadcrumbs />
        {children}
      </main>
    </div>
  );
}
