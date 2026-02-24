import { getCurrentVendor } from "@/lib/auth";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ProfileForm } from "./ProfileForm";

export default async function DashboardProfilePage() {
  const vendor = await getCurrentVendor();
  if (!vendor) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Profile</h1>
        <p className="text-muted-foreground">
          Business name, URL slug, logo, and brand color. This is what customers see on your public page.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Business profile</CardTitle>
          <CardDescription>
            Update your public profile details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            tier={vendor.tier}
            defaultValues={{
              name: vendor.name,
              slug: vendor.slug,
              brandColor: vendor.brandColor,
              logoUrl: vendor.logoUrl ?? "",
              backgroundImageUrl: vendor.backgroundImageUrl ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
