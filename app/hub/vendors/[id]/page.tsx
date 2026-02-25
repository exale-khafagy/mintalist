import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

import { VendorDetail } from "./VendorDetail";

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

      <VendorDetail vendor={vendor} baseUrl={baseUrl} />
    </div>
  );
}
