import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { VendorsList } from "./VendorsList";

export const dynamic = "force-dynamic";

export default async function HubVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { menuItems: true } },
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mintalist.com";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Vendors</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage businesses, tiers, and services. Use Promo codes to generate vouchers.
        </p>
      </div>

      <VendorsList vendors={vendors} baseUrl={baseUrl} />
    </div>
  );
}
