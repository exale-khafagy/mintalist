import Link from "next/link";
import { getCurrentVendor } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { MenuItemList } from "./MenuItemList";

export default async function DashboardMenuPage() {
  const vendor = await getCurrentVendor();
  if (!vendor) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Menu</h1>
        <p className="text-muted-foreground">
          Add and edit items that appear on your public menu.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Menu items</CardTitle>
          <CardDescription>
            {vendor.menuItems.length} item{vendor.menuItems.length !== 1 ? "s" : ""}. Toggle availability or delete from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MenuItemList initialItems={vendor.menuItems} />
        </CardContent>
      </Card>
    </div>
  );
}
