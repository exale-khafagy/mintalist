import { getCurrentVendor } from "@/lib/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { LocationForm } from "./LocationForm";

export default async function DashboardLocationPage() {
  const vendor = await getCurrentVendor();
  if (!vendor) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Location</h1>
        <p className="text-muted-foreground">
          Address, phone, and location name shown on your public menu page.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Contact & location</CardTitle>
          <CardDescription>
            Add your address and phone so customers can find or call you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationForm
            defaultValues={{
              locationName: vendor.locationName ?? "",
              address: vendor.address ?? "",
              phone: vendor.phone ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
