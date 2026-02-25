import dynamic from "next/dynamic";
import { getCurrentVendor } from "@/lib/auth";

const QRCodeGenerator = dynamic(
  () =>
    import("@/components/dashboard/QRCodeGenerator").then((mod) => ({
      default: mod.QRCodeGenerator,
    })),
  {
    loading: () => <div>Loading QR Code...</div>,
  }
);

export default async function DashboardQRPage() {
  const vendor = await getCurrentVendor();
  if (!vendor) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">QR Code</h1>
        <p className="text-muted-foreground">
          Download this QR code to print and place on tables. Customers scan it to open your digital menu.
        </p>
      </header>
      <QRCodeGenerator
        slug={vendor.slug}
        baseUrl={process.env.NEXT_PUBLIC_APP_URL || "https://mintalist.com"}
      />
    </div>
  );
}
