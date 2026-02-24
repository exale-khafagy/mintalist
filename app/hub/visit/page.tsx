"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const TIER_OPTIONS = [
  { value: "FREE", label: "Silver (Free)" },
  { value: "PAID_1", label: "Gold" },
  { value: "PAID_2", label: "Platinum" },
] as const;

export default function HubVendorVisitPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      employeeName: (form.querySelector('[name="employeeName"]') as HTMLInputElement).value,
      employeeEmail: (form.querySelector('[name="employeeEmail"]') as HTMLInputElement).value,
      businessName: (form.querySelector('[name="businessName"]') as HTMLInputElement).value,
      contactName: (form.querySelector('[name="contactName"]') as HTMLInputElement).value,
      contactPhone: (form.querySelector('[name="contactPhone"]') as HTMLInputElement).value,
      contactEmail: (form.querySelector('[name="contactEmail"]') as HTMLInputElement).value,
      address: (form.querySelector('[name="address"]') as HTMLInputElement).value,
      locationName: (form.querySelector('[name="locationName"]') as HTMLInputElement).value,
      agreedTier: (form.querySelector('[name="agreedTier"]') as HTMLSelectElement).value,
      notes: (form.querySelector('[name="notes"]') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/hub/vendor-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error ?? "Failed to save visit");
        return;
      }
      setSuccess(true);
      form.reset();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
          <CardHeader>
            <CardTitle className="text-emerald-800 dark:text-emerald-200">Visit recorded</CardTitle>
            <CardDescription>
              The vendor lead has been saved. You can add another visit below or go back to the Hub.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => setSuccess(false)}
              className="border-emerald-300 dark:border-emerald-700"
            >
              Add another visit
            </Button>
          </CardContent>
        </Card>
        <VendorVisitForm loading={loading} onSubmit={handleSubmit} error={error} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <VendorVisitForm loading={loading} onSubmit={handleSubmit} error={error} />
    </div>
  );
}

function VendorVisitForm({
  loading,
  onSubmit,
  error,
}: {
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor visit</CardTitle>
        <CardDescription>
          After a successful visit, fill this form to register the vendor lead. They can be onboarded once they sign up.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Your details (employee)</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="employeeName" className="mb-1 block text-xs text-zinc-500">
                  Your name *
                </label>
                <Input id="employeeName" name="employeeName" required placeholder="e.g. Ahmed Hassan" />
              </div>
              <div>
                <label htmlFor="employeeEmail" className="mb-1 block text-xs text-zinc-500">
                  Your email *
                </label>
                <Input
                  id="employeeEmail"
                  name="employeeEmail"
                  type="email"
                  required
                  placeholder="you@mintalist.com"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Vendor / business</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="businessName" className="mb-1 block text-xs text-zinc-500">
                  Business name *
                </label>
                <Input id="businessName" name="businessName" required placeholder="e.g. Cairo Coffee House" />
              </div>
              <div>
                <label htmlFor="contactName" className="mb-1 block text-xs text-zinc-500">
                  Contact person name *
                </label>
                <Input id="contactName" name="contactName" required placeholder="e.g. Mohamed Ali" />
              </div>
              <div>
                <label htmlFor="contactPhone" className="mb-1 block text-xs text-zinc-500">
                  Contact phone *
                </label>
                <Input id="contactPhone" name="contactPhone" required placeholder="e.g. 01234567890" />
              </div>
              <div>
                <label htmlFor="contactEmail" className="mb-1 block text-xs text-zinc-500">
                  Contact email (optional)
                </label>
                <Input id="contactEmail" name="contactEmail" type="email" placeholder="owner@cairo-coffee.com" />
              </div>
              <div>
                <label htmlFor="address" className="mb-1 block text-xs text-zinc-500">
                  Address (optional)
                </label>
                <Input id="address" name="address" placeholder="Street, city" />
              </div>
              <div>
                <label htmlFor="locationName" className="mb-1 block text-xs text-zinc-500">
                  Location name (optional)
                </label>
                <Input id="locationName" name="locationName" placeholder="e.g. Downtown branch" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="agreedTier" className="mb-1 block text-xs text-zinc-500">
              Agreed tier *
            </label>
            <select
              id="agreedTier"
              name="agreedTier"
              required
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring"
            >
              {TIER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="mb-1 block text-xs text-zinc-500">
              Notes from the visit (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus:ring-2 focus:ring-ring"
              placeholder="Follow-up, special requests, etc."
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {loading ? "Saving…" : "Save vendor visit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
