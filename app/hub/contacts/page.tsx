import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isHubAdmin } from "@/lib/hub-auth";

export const dynamic = "force-dynamic";

export default async function HubContactsPage() {
  const allowed = await isHubAdmin();
  if (!allowed) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        You don’t have access to the Hub.
      </div>
    );
  }

  let requests: { id: string; vendorId: string; vendorName: string; vendorEmail: string; vendorPhone: string | null; source: string; createdAt: Date }[] = [];
  try {
    requests = await prisma.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // ContactRequest table may not exist yet
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Contact requests</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Vendors who signed up for Gold (onboarding) or clicked Upgrade. Contact them within 24 hours.
        </p>
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-zinc-500">No contact requests yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-900">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-900">Email</th>
                <th className="px-4 py-3 font-medium text-zinc-900">Phone</th>
                <th className="px-4 py-3 font-medium text-zinc-900">Source</th>
                <th className="px-4 py-3 font-medium text-zinc-900">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-900">{r.vendorName}</td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${r.vendorEmail}`} className="text-emerald-600 hover:underline">
                      {r.vendorEmail}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {r.vendorPhone ? (
                      <a href={`tel:${r.vendorPhone.replace(/\s/g, "")}`} className="text-emerald-600 hover:underline">
                        {r.vendorPhone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {r.source === "ONBOARDING_GOLD" ? "Gold signup (1 month free)" : "Upgrade click"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(r.createdAt).toLocaleString()}
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
