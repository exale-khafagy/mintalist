"use client";

import { useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getVendorPublicUrl, type Tier } from "@/lib/urls";

export interface QRCodeGeneratorProps {
  slug: string;
  tier: Tier;
  /** Optional base URL (e.g. https://mintalist.com). Falls back to NEXT_PUBLIC_APP_URL or current origin. */
  baseUrl?: string;
}

function getMenuBaseUrl(baseUrl?: string): string {
  if (baseUrl) return baseUrl.replace(/\/$/, "");
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function QRCodeGenerator({ slug, tier, baseUrl }: QRCodeGeneratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectiveBase = getMenuBaseUrl(baseUrl);
  const menuUrl = getVendorPublicUrl(slug, tier, effectiveBase);

  const handleDownload = useCallback(() => {
    const container = containerRef.current;
    const canvas = container?.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `mintalist-menu-${slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [slug]);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Table QR Code</CardTitle>
        <CardDescription>
          Customers scan this to open your digital menu
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div
          ref={containerRef}
          className="flex items-center justify-center rounded-lg border border-border bg-background p-4"
          style={{ minHeight: 200 }}
        >
          <QRCodeCanvas
            value={menuUrl}
            size={192}
            level="M"
            includeMargin={false}
          />
        </div>
        <p className="text-muted-foreground break-all text-center text-xs">
          {menuUrl}
        </p>
      </CardContent>
      <CardFooter>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Download className="h-4 w-4" />
          Download QR Code
        </button>
      </CardFooter>
    </Card>
  );
}
