"use client";

import { useState } from "react";
import Link from "next/link";
import { getVendorPublicUrl } from "@/lib/urls";
import { HubVendorForm } from "./HubVendorForm";

interface Vendor {
  id: string;
  name: string;
  slug: string;
  tier: "FREE" | "GOLD";
  _count: { menuItems: number; socialLinks: number; customLinks: number };
}

interface VendorDetailProps {
  vendor: Vendor;
  baseUrl: string;
}

export function VendorDetail({ vendor, baseUrl }: VendorDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(vendor.name);
  const [slug, setSlug] = useState(vendor.slug);
  const [showPreview, setShowPreview] = useState(false);

  const publicUrl = getVendorPublicUrl(vendor.slug, baseUrl);

  const handleSave = async () => {
    // TODO: Implement save logic via API
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="rounded bg-zinc-200 px-4 py-2 text-zinc-700 hover:bg-zinc-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-zinc-900">{vendor.name}</h1>
              <p className="mt-1 font-mono text-sm text-zinc-600">{publicUrl}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded bg-zinc-200 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-300"
            >
              Edit
            </button>
          </div>
          <div className="mt-4 flex gap-4">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-600 hover:underline"
            >
              Open public page →
            </a>
            <button
              onClick={() => setShowPreview(true)}
              className="text-sm text-emerald-600 hover:underline"
            >
              Preview
            </button>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-zinc-700">Menu items</dt>
            <dd className="font-medium text-zinc-900">{vendor._count.menuItems}</dd>
            <dt className="text-zinc-700">Social links</dt>
            <dd className="font-medium text-zinc-900">{vendor._count.socialLinks}</dd>
            <dt className="text-zinc-700">Custom links</dt>
            <dd className="font-medium text-zinc-900">{vendor._count.customLinks}</dd>
          </dl>

          <HubVendorForm vendorId={vendor.id} currentTier={vendor.tier} />
        </>
      )}

      {/* Preview Modal: real public page in iframe so background image loads */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/70">
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-2">
            <h2 className="text-sm font-medium text-white">Preview: {vendor.name}</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="rounded bg-zinc-600 px-3 py-1.5 text-sm text-white hover:bg-zinc-500"
            >
              Close
            </button>
          </div>
          <iframe
            src={publicUrl}
            title={`${vendor.name} public page`}
            className="flex-1 w-full min-h-0 bg-white"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      )}
    </div>
  );
}