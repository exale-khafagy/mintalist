import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isHubAdmin } from "@/lib/hub-auth";

export const dynamic = "force-dynamic";

export default async function HubAdClicksPage() {
  const allowed = await isHubAdmin();
  if (!allowed) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        You don’t have access to the Hub.
      </div>
    );
  }

  let clicks: { id: string; vendorId: string; createdAt: Date; vendor: { name: string; slug: string } | null }[] = [];
  try {
    clicks = await prisma.adClick.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        vendorId: true,
        createdAt: true,
        vendor: { select: { name: true, slug: true } },
      },
    });
  } catch {
    // AdClick table may not exist yet
  }

  const withVendor = clicks.map((c) => ({
    ...c,
    vendor: c.vendor ?? { name: "Unknown", slug: "" },
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Ad clicks</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Clicks on the Exale apply ad on Silver vendor pages. They were redirected to exale.net/apply.
        </p>
      </div>

      {withVendor.length === 0 ? (
        <p className="text-sm text-zinc-500">No ad clicks yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-900">Vendor</th>
                <th className="px-4 py-3 font-medium text-zinc-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {withVendor.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{c.vendor.name}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-zinc-500">
        <Link href="/hub" className="text-emerald-600 hover:underline">← Back to Hub</Link>
      </p>
    </div>
  );
}
