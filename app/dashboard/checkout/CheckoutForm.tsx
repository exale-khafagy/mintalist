"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type Tier = "PAID_1" | "PAID_2";

export function CheckoutForm({ tier }: { tier: Tier }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/paymob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to start payment");
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      setError("No redirect URL received");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <Button
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-emerald-600 font-medium hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
      >
        {loading ? "Redirecting..." : "Pay with Paymob"}
      </Button>
    </div>
  );
}
