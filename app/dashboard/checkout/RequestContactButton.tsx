"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RequestContactButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRequest() {
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/contact-request", { method: "POST" });
      if (res.ok) {
        router.push("/dashboard/checkout?requested=1");
        return;
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleRequest}
      disabled={loading}
      className="inline-flex items-center rounded-full border-2 border-emerald-600 bg-transparent px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-600 hover:text-white disabled:opacity-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white"
    >
      {loading ? "Sending…" : "Request contact — we'll reach out within 24 hours"}
    </button>
  );
}
