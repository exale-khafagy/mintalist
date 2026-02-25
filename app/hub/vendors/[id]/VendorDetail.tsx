"use client";

import { useState } from "react";
import Link from "next/link";
import { HubVendorForm } from "./HubVendorForm";

interface Vendor {
  id: string;
  name: string;
  slug: string;
  tier: "FREE" | "PAID_1" | "PAID_2";
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
              <p className="mt-1 font-mono text-sm text-zinc-500">{baseUrl}/{vendor.slug}</p>
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
              href={`${baseUrl}/${vendor.slug}`}
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
            <dt className="text-zinc-500">Menu items</dt>
            <dd className="font-medium">{vendor._count.menuItems}</dd>
            <dt className="text-zinc-500">Social links</dt>
            <dd className="font-medium">{vendor._count.socialLinks}</dd>
            <dt className="text-zinc-500">Custom links</dt>
            <dd className="font-medium">{vendor._count.customLinks}</dd>
          </dl>

          <HubVendorForm vendorId={vendor.id} currentTier={vendor.tier} />
        </>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-w-md rounded-lg bg-white p-6">
            <h2 className="text-lg font-semibold">Preview</h2>
            <p className="mt-2 text-sm text-zinc-600">
              This is a preview of the vendor's public page. In a real implementation, embed an iframe or screenshot.
            </p>
            <button
              onClick={() => setShowPreview(false)}
              className="mt-4 rounded bg-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}