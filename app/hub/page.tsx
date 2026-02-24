import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Vendors</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage businesses, tiers, and services. Use Promo codes to generate vouchers.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-700">Name</th>
              <th className="px-4 py-3 font-medium text-zinc-700">Slug</th>
              <th className="px-4 py-3 font-medium text-zinc-700">Tier</th>
              <th className="px-4 py-3 font-medium text-zinc-700">Menu</th>
              <th className="px-4 py-3 font-medium text-zinc-700">Public link</th>
              <th className="px-4 py-3 font-medium text-zinc-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                <td className="px-4 py-3 font-medium text-zinc-900">{v.name}</td>
                <td className="px-4 py-3 font-mono text-zinc-600">{v.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      v.tier === "FREE"
                        ? "rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700"
                        : "rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                    }
                  >
                    {v.tier}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600">{v._count.menuItems} items</td>
                <td className="px-4 py-3">
                  <a
                    href={`${baseUrl}/${v.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:underline"
                  >
                    View
                  </a>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/hub/vendors/${v.id}`}
                    className="font-medium text-emerald-600 hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vendors.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">No vendors yet.</p>
        )}
      </div>
    </div>
  );
}
