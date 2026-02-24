import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const SOCIAL_PLATFORMS = ["instagram", "facebook", "tiktok", "x", "youtube", "linkedin", "whatsapp"] as const;

const createSocialSchema = z.object({
  type: z.literal("social"),
  platform: z.enum(SOCIAL_PLATFORMS),
  url: z.string().url(),
});

const createCustomSchema = z.object({
  type: z.literal("custom"),
  title: z.string().min(1),
  url: z.string().url(),
});

const createSchema = z.discriminatedUnion("type", [
  createSocialSchema,
  createCustomSchema,
]);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({
    where: { clerkUserId: userId },
    include: {
      socialLinks: { orderBy: { platform: "asc" } },
      customLinks: { orderBy: { title: "asc" } },
    },
  });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  return NextResponse.json({
    socialLinks: vendor.socialLinks,
    customLinks: vendor.customLinks,
  });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({
    where: { clerkUserId: userId },
  });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (body.type === "social") {
    const existing = await prisma.vendorSocialLink.findFirst({
      where: { vendorId: vendor.id, platform: body.platform },
    });
    if (existing) {
      const updated = await prisma.vendorSocialLink.update({
        where: { id: existing.id },
        data: { url: body.url },
      });
      return NextResponse.json(updated);
    }
    const created = await prisma.vendorSocialLink.create({
      data: {
        vendorId: vendor.id,
        platform: body.platform,
        url: body.url,
      },
    });
    return NextResponse.json(created);
  }

  const created = await prisma.vendorCustomLink.create({
    data: {
      vendorId: vendor.id,
      title: body.title,
      url: body.url,
    },
  });
  return NextResponse.json(created);
}
