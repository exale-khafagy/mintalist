"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SOCIAL_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "x", label: "X (Twitter)" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

type SocialLink = { id: string; platform: string; url: string };
type CustomLink = { id: string; title: string; url: string };

export function LinksManager({
  socialLinks,
  customLinks,
}: {
  socialLinks: SocialLink[];
  customLinks: CustomLink[];
}) {
  const router = useRouter();
  const [social, setSocial] = useState<SocialLink[]>(socialLinks);
  const [custom, setCustom] = useState<CustomLink[]>(customLinks);
  const [adding, setAdding] = useState<"social" | "custom" | null>(null);
  const [form, setForm] = useState({
    platform: "instagram",
    title: "",
    url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSocial(socialLinks);
    setCustom(customLinks);
  }, [socialLinks, customLinks]);

  async function handleAddSocial() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "social", platform: form.platform, url: form.url }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed");
      }
      const created = await res.json();
      setSocial((prev) => [...prev, created]);
      setForm({ platform: "instagram", title: "", url: "" });
      setAdding(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCustom() {
    if (!form.title.trim() || !form.url.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "custom", title: form.title.trim(), url: form.url }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Failed");
      }
      const created = await res.json();
      setCustom((prev) => [...prev, created]);
      setForm({ platform: "instagram", title: "", url: "" });
      setAdding(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this link?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/vendor/links/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setSocial((prev) => prev.filter((l) => l.id !== id));
      setCustom((prev) => prev.filter((l) => l.id !== id));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>
      )}

      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Social links</h3>
        <ul className="space-y-2">
          {social.map((link) => (
            <li
              key={link.id}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2"
            >
              <span className="capitalize text-foreground">{link.platform}</span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-emerald-600 hover:underline"
              >
                {link.url}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(link.id)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </li>
          ))}
        </ul>
        {adding === "social" ? (
            <div className="mt-3 flex flex-wrap items-end gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {SOCIAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs font-medium">URL</label>
              <Input
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <Button onClick={handleAddSocial} disabled={loading || !form.url}>
              Add
            </Button>
            <Button variant="outline" onClick={() => setAdding(null)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setAdding("social")}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add social link
          </Button>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Custom links</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          Order online, reservations, delivery, etc.
        </p>
        <ul className="space-y-2">
          {custom.map((link) => (
            <li
              key={link.id}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2"
            >
              <span className="font-medium text-foreground">{link.title}</span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm text-emerald-600 hover:underline"
              >
                {link.url}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(link.id)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </li>
          ))}
        </ul>
        {adding === "custom" ? (
          <div className="mt-3 space-y-2">
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Link title (e.g. Order online)"
            />
            <Input
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddCustom}
                disabled={loading || !form.title.trim() || !form.url.trim()}
              >
                Add
              </Button>
              <Button variant="outline" onClick={() => setAdding(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setAdding("custom")}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add custom link
          </Button>
        )}
      </div>
    </div>
  );
}
