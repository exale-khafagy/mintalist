"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HubPromoForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [tier, setTier] = useState<"PAID_1" | "PAID_2">("PAID_1");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/hub/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          tier,
          expiresInDays: expiresInDays ? parseInt(expiresInDays, 10) : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to create");
        return;
      }
      setSuccess(`Created: ${data.code} → ${data.tier}`);
      setCode("");
      setExpiresInDays("");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Code</label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. SUMMER2025"
          className="font-mono uppercase"
          disabled={loading}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Tier</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tier"
              checked={tier === "PAID_1"}
              onChange={() => setTier("PAID_1")}
              className="h-4 w-4"
            />
            <span className="text-sm">PAID_1</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tier"
              checked={tier === "PAID_2"}
              onChange={() => setTier("PAID_2")}
              className="h-4 w-4"
            />
            <span className="text-sm">PAID_2</span>
          </label>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Expires in (days, optional)</label>
        <Input
          type="number"
          min={1}
          value={expiresInDays}
          onChange={(e) => setExpiresInDays(e.target.value)}
          placeholder="e.g. 30"
          disabled={loading}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm font-medium text-emerald-600">{success}</p>}
      <Button type="submit" disabled={loading || !code.trim()}>
        {loading ? "Creating..." : "Create voucher"}
      </Button>
    </form>
  );
}
