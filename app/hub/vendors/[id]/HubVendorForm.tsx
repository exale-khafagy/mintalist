"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type Tier = "FREE" | "PAID_1" | "PAID_2";

export function HubVendorForm({
  vendorId,
  currentTier,
}: {
  vendorId: string;
  currentTier: Tier;
}) {
  const router = useRouter();
  const [tier, setTier] = useState<Tier>(currentTier);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/hub/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-zinc-200 pt-6">
      <h2 className="text-sm font-medium text-zinc-700">Change tier</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Override this vendor&apos;s plan (e.g. for support or promotions).
      </p>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {(["FREE", "PAID_1", "PAID_2"] as const).map((t) => (
          <label key={t} className="flex items-center gap-2">
            <input
              type="radio"
              name="tier"
              value={t}
              checked={tier === t}
              onChange={() => setTier(t)}
              className="h-4 w-4"
            />
            <span className="text-sm">{t}</span>
          </label>
        ))}
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Saving..." : "Save tier"}
        </Button>
      </div>
    </form>
  );
}
