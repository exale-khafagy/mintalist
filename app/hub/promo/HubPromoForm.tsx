"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { label: "Join Free always", tier: "FREE" as const, expiresInDays: undefined },
  { label: "Try Gold 1 month for free", tier: "PAID_1" as const, expiresInDays: 30 },
];

export function HubPromoForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [presetIndex, setPresetIndex] = useState<number>(0);
  const [tier, setTier] = useState<"FREE" | "PAID_1">("FREE");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function applyPreset(index: number) {
    setPresetIndex(index);
    const p = PRESETS[index]!;
    setTier(p.tier);
    setExpiresInDays(p.expiresInDays != null ? String(p.expiresInDays) : "");
  }

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
        <label className="mb-1 block text-sm font-medium">Preset (optional)</label>
        <select
          value={presetIndex}
          onChange={(e) => applyPreset(Number(e.target.value))}
          className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          {PRESETS.map((p, i) => (
            <option key={i} value={i}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Code</label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. GOLD-JAN2025"
          className="font-mono uppercase"
          disabled={loading}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Tier</label>
        <div className="flex flex-wrap gap-4">
          {(["FREE", "PAID_1"] as const).map((t) => (
            <label key={t} className="flex items-center gap-2">
              <input
                type="radio"
                name="tier"
                checked={tier === t}
                onChange={() => setTier(t)}
                className="h-4 w-4"
              />
              <span className="text-sm">{t === "FREE" ? "Silver (Free)" : "Gold"}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Expires in (days, optional — leave empty for no expiry)</label>
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
