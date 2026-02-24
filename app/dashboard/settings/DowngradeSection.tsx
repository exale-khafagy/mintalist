"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Tier = "FREE" | "PAID_1" | "PAID_2";

type Props = {
  tier: Tier;
};

export function DowngradeSection({ tier }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (tier === "FREE") return null;

  async function handleDowngrade() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/downgrade", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to downgrade");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  return (
    <Card className="border-amber-200 dark:border-amber-900/50">
      <CardHeader>
        <CardTitle>Downgrade to Silver</CardTitle>
        <CardDescription>
          You will keep your menu, links, and profile data. You will lose:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-inside list-disc text-sm text-muted-foreground">
          <li>Custom URL (you’ll get a new random link, e.g. mintalist.com/xy7k2m9a)</li>
          <li>Background image on your public page</li>
          {tier === "PAID_2" && (
            <li>Your subdomain (e.g. yourcafe.mintalist.com)</li>
          )}
          <li>Ads will appear on your public menu (Powered by Mintalist)</li>
        </ul>
        {!confirming ? (
          <Button
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/50 dark:hover:text-amber-300"
            onClick={() => setConfirming(true)}
          >
            Downgrade to Silver
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => { setConfirming(false); setError(null); }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDowngrade}
              disabled={loading}
            >
              {loading ? "Downgrading…" : "Yes, downgrade to Silver"}
            </Button>
          </div>
        )}
        {error && (
          <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
