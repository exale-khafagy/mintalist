"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function BreadcrumbsInner() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ");
    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            <span className="mx-2">/</span>
            {index === breadcrumbs.length - 1 ? (
              <span className="text-foreground font-medium">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Breadcrumbs() {
  return <BreadcrumbsInner />;
}