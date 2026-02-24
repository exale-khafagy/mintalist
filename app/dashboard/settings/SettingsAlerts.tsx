"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SettingsAlerts() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const upgrade = searchParams.get("upgrade");
  const error = searchParams.get("error");

  if (upgrade === "success") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
        Payment successful. Your account has been upgraded.
      </div>
    );
  }

  if (error) {
    const messages: Record<string, string> = {
      missing_params: "Invalid return from payment.",
      payment_not_found: "Payment not found.",
      payment_failed: "Payment was not successful.",
    };
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
        {messages[error] ?? "Something went wrong."}
      </div>
    );
  }

  return null;
}
