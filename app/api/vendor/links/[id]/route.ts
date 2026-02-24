import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const SOCIAL_PLATFORMS = ["instagram", "facebook", "tiktok", "x", "youtube", "linkedin", "whatsapp"] as const;

const updateSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS).optional(),
  title: z.string().min(1).optional(),
  url: z.string().url().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({
    where: { clerkUserId: userId },
  });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  const { id } = await params;

  const social = await prisma.vendorSocialLink.findFirst({
    where: { id, vendorId: vendor.id },
  });
  if (social) {
    let body: z.infer<typeof updateSchema>;
    try {
      body = updateSchema.parse(await req.json());
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    if (body.title !== undefined) return NextResponse.json({ error: "Social links use platform, not title" }, { status: 400 });
    const updated = await prisma.vendorSocialLink.update({
      where: { id },
      data: {
        ...(body.platform !== undefined && { platform: body.platform }),
        ...(body.url !== undefined && { url: body.url }),
      },
    });
    return NextResponse.json(updated);
  }

  const custom = await prisma.vendorCustomLink.findFirst({
    where: { id, vendorId: vendor.id },
  });
  if (custom) {
    let body: z.infer<typeof updateSchema>;
    try {
      body = updateSchema.parse(await req.json());
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    if (body.platform !== undefined) return NextResponse.json({ error: "Custom links use title, not platform" }, { status: 400 });
    const updated = await prisma.vendorCustomLink.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.url !== undefined && { url: body.url }),
      },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({
    where: { clerkUserId: userId },
  });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  const { id } = await params;

  const social = await prisma.vendorSocialLink.findFirst({
    where: { id, vendorId: vendor.id },
  });
  if (social) {
    await prisma.vendorSocialLink.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  }

  const custom = await prisma.vendorCustomLink.findFirst({
    where: { id, vendorId: vendor.id },
  });
  if (custom) {
    await prisma.vendorCustomLink.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
