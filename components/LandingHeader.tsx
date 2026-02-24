"use client";

import Link from "next/link";
import { useState } from "react";

export function LandingHeader() {
  const [logoError, setLogoError] = useState(false);

  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
      {!logoError ? (
        <img
          src="/mintalist-logo.png"
          alt="Mintalist"
          className="h-8 w-auto sm:h-9"
          onError={() => setLogoError(true)}
        />
      ) : (
        <span>Mintalist</span>
      )}
    </Link>
  );
}
