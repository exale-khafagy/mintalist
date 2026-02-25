import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EXALE_APPLY_URL = "https://exale.net/apply";

/** GET /api/redirect/apply?slug=xxx — Record ad click for Hub, then redirect to exale.net/apply */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug")?.trim();

  if (slug) {
    try {
      const vendor = await prisma.vendor.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (vendor) {
        await prisma.adClick.create({
          data: { vendorId: vendor.id },
        });
      }
    } catch {
      // Table may not exist or DB error; still redirect
    }
  }

  return NextResponse.redirect(EXALE_APPLY_URL, 302);
}
