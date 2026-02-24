import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Hub access: allowed if the signed-in user's email is in HUB_ADMIN_EMAILS
 * or their Clerk user ID is in HUB_ADMIN_USER_IDS (comma-separated).
 * Founder/main access: set HUB_ADMIN_EMAILS=khafagy.ahmedibrahim@gmail.com
 */
export async function isHubAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const allowedIds = process.env.HUB_ADMIN_USER_IDS;
  if (allowedIds?.trim()) {
    const ids = allowedIds.split(",").map((id) => id.trim());
    if (ids.includes(userId)) return true;
  }

  const allowedEmails = process.env.HUB_ADMIN_EMAILS;
  if (allowedEmails?.trim()) {
    const user = await currentUser();
    const primaryEmail = user?.primaryEmailAddress?.emailAddress;
    const emails = user?.emailAddresses?.map((e) => e.emailAddress) ?? [];
    const currentEmail = primaryEmail ?? emails[0];
    if (currentEmail) {
      const list = allowedEmails.split(",").map((e) => e.trim().toLowerCase());
      if (list.includes(currentEmail.toLowerCase())) return true;
    }
  }

  return false;
}
