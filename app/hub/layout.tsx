import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { isHubAdmin } from "@/lib/hub-auth";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed = await isHubAdmin();
  if (!allowed) redirect("/");

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
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
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
