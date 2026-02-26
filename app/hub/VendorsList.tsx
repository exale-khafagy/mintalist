"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { getVendorPublicUrl } from "@/lib/urls";

interface Vendor {
  id: string;
  name: string;
  slug: string;
  tier: "FREE" | "GOLD";
  _count: { menuItems: number };
}

interface VendorsListProps {
  vendors: Vendor[];
  baseUrl: string;
}

export function VendorsList({ vendors, baseUrl }: VendorsListProps) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"ALL" | "FREE" | "GOLD">("ALL");

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
                            v.slug.toLowerCase().includes(search.toLowerCase());
      const matchesTier = tierFilter === "ALL" || v.tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [vendors, search, tierFilter]);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as any)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none"
        >
          <option value="ALL">All Tiers</option>
          <option value="FREE">Free</option>
          <option value="GOLD">Gold</option>
        </select>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length === 0 ? (
        <p className="text-center text-sm text-zinc-600">No vendors found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((v) => (
            <div key={v.id} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md">
              <h3 className="font-semibold text-zinc-900">{v.name}</h3>
              <p className="text-sm text-zinc-600">Slug: {v.slug}</p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    v.tier === "FREE"
                      ? "bg-zinc-200 text-zinc-700"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {v.tier}
                </span>
                <span className="text-sm text-zinc-600">{v._count.menuItems} items</span>
              </div>
              <div className="mt-4 flex gap-2">
                <a
                  href={getVendorPublicUrl(v.slug, baseUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 hover:underline"
                >
                  View
                </a>
                <Link
                  href={`/hub/vendors/${v.id}`}
                  className="text-sm font-medium text-emerald-600 hover:underline"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}