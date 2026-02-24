import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HubPromoForm } from "./HubPromoForm";

export const dynamic = "force-dynamic";

export default function HubPromoPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Promo codes</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Generate voucher codes for promotions. Vendors redeem them in Settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create voucher</CardTitle>
          <CardDescription>
            Code is case-insensitive. Optional expiry in days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HubPromoForm />
        </CardContent>
      </Card>
    </div>
  );
}
