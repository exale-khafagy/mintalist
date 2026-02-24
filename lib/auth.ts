import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Get the current vendor for the signed-in Clerk user.
 * Returns null if not signed in, no vendor record, or any Prisma error (e.g. before webhook ran).
 */
export async function getCurrentVendor() {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { clerkUserId: userId },
      include: {
        menuItems: true,
        socialLinks: true,
        customLinks: true,
      },
    });
    if (!vendor) return null;
    // Sort in memory to avoid Prisma runtime validation issues with nested orderBy
    return {
      ...vendor,
      menuItems: [...vendor.menuItems].sort((a, b) => a.name.localeCompare(b.name)),
      socialLinks: [...vendor.socialLinks].sort((a, b) => a.platform.localeCompare(b.platform)),
      customLinks: [...vendor.customLinks].sort((a, b) => a.title.localeCompare(b.title)),
    };
  } catch {
    return null;
  }
}
