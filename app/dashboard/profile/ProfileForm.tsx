"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadDropzone } from "@/lib/uploadthing";

const BASE_URL =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL
    ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
    : "https://mintalist.com";

type Tier = "FREE" | "PAID_1" | "PAID_2";

type Props = {
  tier: Tier;
  defaultValues: {
    name: string;
    slug: string;
    brandColor: string;
    logoUrl: string;
    backgroundImageUrl: string;
  };
};

export function ProfileForm({ tier, defaultValues }: Props) {
  const router = useRouter();
  const [name, setName] = useState(defaultValues.name);
  const [slug, setSlug] = useState(defaultValues.slug);
  const [brandColor, setBrandColor] = useState(defaultValues.brandColor);
  const [logoUrl, setLogoUrl] = useState(defaultValues.logoUrl);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(
    defaultValues.backgroundImageUrl
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canEditSlug = tier === "PAID_1" || tier === "PAID_2";
  const menuLink = `${BASE_URL}/${slug}`;

  function copyMenuLink() {
    void navigator.clipboard.writeText(menuLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  const canSetBackgroundImage = canEditSlug;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: Record<string, string | undefined> = {
        name,
        brandColor,
        logoUrl: logoUrl || undefined,
      };
      if (canEditSlug) payload.slug = slug;
      if (canSetBackgroundImage) payload.backgroundImageUrl = backgroundImageUrl || undefined;

      const res = await fetch("/api/vendor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        <label className="mb-1 block text-sm font-medium">Business name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Mint Cafe"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          {canEditSlug ? "Menu URL" : "Your menu link"}
        </label>
        {canEditSlug ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            <span>mintalist.com/</span>
            <Input
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
              }
              required
              className="flex-1 border-0 bg-transparent p-0 text-foreground focus-visible:ring-0"
              placeholder="my-cafe"
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground font-mono">
                {menuLink}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyMenuLink}
                className="shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1.5" />
                    Copy link
                  </>
                )}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Custom URL available on Gold or Platinum.{" "}
              <Link href="/dashboard/checkout" className="text-emerald-600 hover:underline">
                Upgrade
              </Link>
            </p>
          </>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Brand color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded border border-border p-1"
          />
          <Input
            value={brandColor}
            onChange={(e) => setBrandColor(e.target.value)}
            className="flex-1 font-mono text-sm"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Logo (optional)</label>
        <p className="mb-2 text-xs text-muted-foreground">
          Upload or paste a URL. Shown on your public menu page.
        </p>
        <UploadDropzone
          endpoint="logoUploader"
          onClientUploadComplete={(res) => {
            const url = res?.[0]?.url;
            if (url) setLogoUrl(url);
          }}
          onUploadError={(error: Error) => {
            setError(error.message);
          }}
          className="ut-label:text-sm ut-button:bg-emerald-600 ut-button:ut-readying:bg-emerald-600/50"
        />
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Or paste URL:</span>
          <Input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 text-sm"
          />
        </div>
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Logo preview"
            className="mt-2 h-16 w-16 rounded-full border object-cover"
          />
        )}
      </div>
      {canSetBackgroundImage && (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Background image (optional)
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            Upload or paste a URL. Shown behind your menu on the public page.
          </p>
          <UploadDropzone
            endpoint="backgroundImageUploader"
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.url;
              if (url) setBackgroundImageUrl(url);
            }}
            onUploadError={(error: Error) => {
              setError(error.message);
            }}
            className="ut-label:text-sm ut-button:bg-emerald-600 ut-button:ut-readying:bg-emerald-600/50"
          />
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Or paste URL:</span>
            <Input
              value={backgroundImageUrl}
              onChange={(e) => setBackgroundImageUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 text-sm"
            />
          </div>
          {backgroundImageUrl && (
            <img
              src={backgroundImageUrl}
              alt="Background preview"
              className="mt-2 h-24 w-full rounded border object-cover"
            />
          )}
        </div>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
