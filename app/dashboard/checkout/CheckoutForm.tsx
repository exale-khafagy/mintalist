"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type Tier = "PAID_1" | "PAID_2";
type Period = "MONTHLY" | "ANNUAL";

export function CheckoutForm({ tier }: { tier: Tier }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("MONTHLY");

  async function handlePay() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/paymob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, period }),
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
      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name={`period-${tier}`}
            value="MONTHLY"
            checked={period === "MONTHLY"}
            onChange={() => setPeriod("MONTHLY")}
            className="mr-2"
          />
          Monthly
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name={`period-${tier}`}
            value="ANNUAL"
            checked={period === "ANNUAL"}
            onChange={() => setPeriod("ANNUAL")}
            className="mr-2"
          />
          Annual
        </label>
      </div>
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
