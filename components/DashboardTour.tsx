"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const TOUR_STORAGE_KEY = "mintalist-dashboard-tour-seen";

export function DashboardTour() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const seen = localStorage.getItem(TOUR_STORAGE_KEY);
      setShow(!seen);
    } catch {
      setShow(false);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
      setShow(false);
    } catch {
      setShow(false);
    }
  }

  if (!show) return null;

  return (
    <div className="relative rounded-lg border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-foreground dark:bg-emerald-950/40">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-emerald-100 hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="font-medium text-foreground pr-8">Welcome to your dashboard</p>
      <p className="mt-1 text-muted-foreground">
        Here’s how to get started:
      </p>
      <ul className="mt-2 list-inside list-disc space-y-0.5 text-muted-foreground">
        <li>
          <Link href="/dashboard/profile" className="text-emerald-700 hover:underline">
            Profile
          </Link>
          {" "}
          — Edit your business name, logo, and brand color
        </li>
        <li>
          <Link href="/dashboard/menu" className="text-emerald-700 hover:underline">
            Menu
          </Link>
          {" "}
          — Add and manage menu items
        </li>
        <li>
          <Link href="/dashboard/links" className="text-emerald-700 hover:underline">
            Links
          </Link>
          {" "}
          and{" "}
          <Link href="/dashboard/location" className="text-emerald-700 hover:underline">
            Location
          </Link>
          {" "}
          — Add social links and address
        </li>
      </ul>
    </div>
  );
}
