import { getCurrentVendor } from "@/lib/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { LinksManager } from "./LinksManager";

export default async function DashboardLinksPage() {
  const vendor = await getCurrentVendor();
  if (!vendor) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Links</h1>
        <p className="text-muted-foreground">
          Social media and custom links shown on your public menu page.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Social & custom links</CardTitle>
          <CardDescription>
            Add social profiles and custom links (order online, reservations, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinksManager
            socialLinks={vendor.socialLinks}
            customLinks={vendor.customLinks}
          />
        </CardContent>
      </Card>
    </div>
  );
}
