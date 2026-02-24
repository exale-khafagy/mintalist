"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  defaultValues: {
    locationName: string;
    address: string;
    phone: string;
  };
};

export function LocationForm({ defaultValues }: Props) {
  const router = useRouter();
  const [locationName, setLocationName] = useState(defaultValues.locationName);
  const [address, setAddress] = useState(defaultValues.address);
  const [phone, setPhone] = useState(defaultValues.phone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName: locationName || "",
          address: address || "",
          phone: phone || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">Location name (optional)</label>
        <Input
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="e.g. Downtown, Branch 2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Address (optional)</label>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Full street address"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Phone (optional)</label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +1 234 567 8900"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
