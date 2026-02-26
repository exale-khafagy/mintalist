"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  defaultValues: {
    locationName: string;
    address: string;
    phone: string;
    latitude?: number | null;
    longitude?: number | null;
  };
};

export function LocationForm({ defaultValues }: Props) {
  const router = useRouter();
  const [locationName, setLocationName] = useState(defaultValues.locationName);
  const [address, setAddress] = useState(defaultValues.address);
  const [phone, setPhone] = useState(defaultValues.phone);
  const [latitude, setLatitude] = useState<number | null>(defaultValues.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(defaultValues.longitude ?? null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationError(null);
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationLoading(false);
      },
      (err) => {
        setLocationError(err.message || "Could not get location.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }

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
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
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
        <label className="mb-1 block text-sm font-medium">Location name</label>
        <Input
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="e.g. Downtown, Branch 2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Address</label>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Full street address"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Phone</label>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +1 234 567 8900"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Coordinates</label>
        <p className="mb-2 text-xs text-muted-foreground">
          Use your browser to save your location. No API key required.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={handleGetLocation} disabled={locationLoading}>
          <MapPin className="mr-2 h-4 w-4" />
          {locationLoading ? "Getting location…" : "Use my current location"}
        </Button>
        {locationError && <p className="mt-1 text-xs text-red-600">{locationError}</p>}
        {latitude != null && longitude != null && (
          <p className="mt-2 text-xs text-muted-foreground">
            Saved: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </p>
        )}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
