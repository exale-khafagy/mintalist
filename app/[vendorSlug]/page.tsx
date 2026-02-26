import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

import { ExaleFooter } from "@/components/ExaleFooter";

// Calculates if text should be black or white based on the background color
function getContrastColor(hexColor: string | null) {
  if (!hexColor || !hexColor.startsWith("#")) return "#71717a"; // Default gray fallback
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#18181b" : "#ffffff"; // Dark gray for light bg, White for dark bg
}

type Props = {
  params: Promise<{ vendorSlug: string }>;
};

export const revalidate = 60;

export default async function VendorPublicPage({ params }: Props) {
  const { vendorSlug } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: { slug: vendorSlug },
    include: {
      menuItems: {
        where: { isAvailable: true },
        orderBy: { name: "asc" },
      },
      socialLinks: { orderBy: { platform: "asc" } },
      customLinks: { orderBy: { title: "asc" } },
    },
  });

  if (!vendor) notFound();

  const hasLinks = vendor.socialLinks.length > 0 || vendor.customLinks.length > 0;
  const hasLocation = vendor.locationName || vendor.address || vendor.phone;

  const isPaid = vendor.tier === "GOLD";
  const showAds = vendor.tier === "FREE";
  
  const backgroundStyle =
    isPaid && vendor.backgroundImageUrl
      ? {
          backgroundImage: `url(${vendor.backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : { backgroundColor: vendor.brandColor || "#f9fafb" };

  const footerTextColor = 
    isPaid && vendor.backgroundImageUrl 
      ? "#ffffff"
      : getContrastColor(vendor.brandColor);

  return (
    <div className="flex min-h-screen flex-col" style={backgroundStyle}>
      <main className="flex-1 px-3 py-4 sm:px-4 sm:py-8">
        <div
          className="mx-auto max-w-2xl rounded-xl border border-border bg-card/95 shadow-sm backdrop-blur-sm"
          style={{ borderTopColor: vendor.brandColor || undefined, borderTopWidth: 4 }}
        >
          <div className="p-4 sm:p-6">
            <header className="mb-4 flex flex-wrap items-center gap-3 sm:mb-6 sm:gap-4">
              {vendor.logoUrl && (
                <img
                  src={vendor.logoUrl}
                  alt={vendor.name}
                  className="h-12 w-12 shrink-0 rounded-full border border-border object-cover sm:h-16 sm:w-16"
                />
              )}
              <div className="min-w-0 flex-1">
                <h1
                  className="truncate text-xl font-semibold sm:text-2xl"
                  style={{ color: vendor.brandColor || "inherit" }}
                >
                  {vendor.name}
                </h1>
                <p className="text-sm text-muted-foreground">Digital menu</p>
              </div>
            </header>

            {vendor.menuItems.length === 0 ? (
              <p className="text-muted-foreground">No menu items available yet.</p>
            ) : (
              <section className="mb-6">
                <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Menu
                </h2>
                <ul className="space-y-3 sm:space-y-4">
                  {vendor.menuItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col gap-1 rounded-lg border border-border bg-muted/50 p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-medium text-foreground">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-foreground">
                        {Number(item.price).toFixed(0)} LE
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {hasLinks && (
              <section className="mb-4 sm:mb-6">
                <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground sm:mb-3">
                  Links
                </h2>
                <div className="flex flex-wrap gap-2">
                  {vendor.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
                      style={{ borderColor: vendor.brandColor || undefined }}
                    >
                      {link.platform}
                    </a>
                  ))}
                  {vendor.customLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
                      style={{ borderColor: vendor.brandColor || undefined }}
                    >
                      {link.title}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {hasLocation && (
              <section className="mb-4 sm:mb-6">
                <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground sm:mb-3">
                  Location & contact
                </h2>
                <div className="space-y-1 text-sm text-foreground">
                  {vendor.locationName && (
                    <p className="font-medium">{vendor.locationName}</p>
                  )}
                  {vendor.address && <p>{vendor.address}</p>}
                  {vendor.phone && (
                    <a
                      href={`tel:${vendor.phone.replace(/\s/g, "")}`}
                      className="text-emerald-600 hover:underline"
                    >
                      {vendor.phone}
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        {showAds && (
          <div className="mx-auto mt-4 flex max-w-2xl flex-col items-center gap-3 sm:mt-6 sm:gap-4">
            <a
              href={`/api/redirect/apply?slug=${encodeURIComponent(vendor.slug)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-md rounded-xl border border-border bg-card/95 shadow-sm backdrop-blur-sm transition hover:border-emerald-500 hover:opacity-95"
            >
              <img
                src="/ads.png"
                alt="Apply with Exale"
                className="h-auto w-full rounded-xl object-contain"
              />
            </a>
            <a
              href="https://mintalist.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-wrap items-center justify-center gap-1 rounded-xl border border-border bg-card/95 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur-sm transition hover:border-border hover:bg-card sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
            >
              <span className="text-muted-foreground">Powered by</span>
              <span className="font-semibold text-foreground">Mintalist</span>
              <span className="text-muted-foreground">— one link for your menu</span>
            </a>
          </div>
        )}
      </main>
      
      <ExaleFooter textColor={footerTextColor} />
    </div>
  );
}