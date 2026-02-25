import { redirect } from "next/navigation";
import { isHubAdmin } from "@/lib/hub-auth";

/**
 * After sign-in, Clerk sends users here. Hub admins go to /hub; others go to /dashboard.
 */
export default async function RedirectAfterAuthPage() {
  const hubAdmin = await isHubAdmin();
  if (hubAdmin) redirect("/hub");
  redirect("/dashboard");
}
