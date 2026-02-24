import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import { HubVendorForm } from "./HubVendorForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function HubVendorPage({ params }: Props) {
  const { id } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      _count: { select: { menuItems: true, socialLinks: true, customLinks: true } },
    },
  });

  if (!vendor) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mintalist.com";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hub" className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Vendors
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">{vendor.name}</h1>
        <p className="mt-1 font-mono text-sm text-zinc-500">mintalist.com/{vendor.slug}</p>
        <a
          href={`${baseUrl}/${vendor.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-emerald-600 hover:underline"
        >
          Open public page →
        </a>

        <dl className="mt-6 grid grid-cols-2 gap-2 text-sm">
          <dt className="text-zinc-500">Menu items</dt>
          <dd className="font-medium">{vendor._count.menuItems}</dd>
          <dt className="text-zinc-500">Social links</dt>
          <dd className="font-medium">{vendor._count.socialLinks}</dd>
          <dt className="text-zinc-500">Custom links</dt>
          <dd className="font-medium">{vendor._count.customLinks}</dd>
        </dl>

        <HubVendorForm vendorId={vendor.id} currentTier={vendor.tier} />
      </div>
    </div>
  );
}
