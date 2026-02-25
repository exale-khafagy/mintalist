import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  brandColor: z.string().regex(/^#([0-9a-fA-F]{6})$/).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  backgroundImageUrl: z.string().url().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  locationName: z.string().optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({
    where: { clerkUserId: userId },
  });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  let body: z.infer<typeof updateSchema>;
  try {
    body = updateSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const canEditSlug = vendor.tier === "PAID_1";
  const canSetBackgroundImage = canEditSlug;

  if (body.slug !== undefined && body.slug !== vendor.slug) {
    if (!canEditSlug) {
      return NextResponse.json(
        { error: "Custom URL is available on Gold. Upgrade to change your slug." },
        { status: 403 }
      );
    }
    const taken = await prisma.vendor.findFirst({
      where: { slug: body.slug, id: { not: vendor.id } },
    });
    if (taken) {
      return NextResponse.json(
        { error: "This URL is already taken." },
        { status: 409 }
      );
    }
  }

  if (body.backgroundImageUrl !== undefined && !canSetBackgroundImage) {
    return NextResponse.json(
      { error: "Background image is available on Gold." },
      { status: 403 }
    );
  }

  const updated = await prisma.vendor.update({
    where: { clerkUserId: userId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && canEditSlug && { slug: body.slug }),
      ...(body.brandColor !== undefined && { brandColor: body.brandColor }),
      ...(body.logoUrl !== undefined && {
        logoUrl: body.logoUrl === "" ? null : body.logoUrl,
      }),
      ...(body.backgroundImageUrl !== undefined && canSetBackgroundImage && {
        backgroundImageUrl: body.backgroundImageUrl === "" ? null : body.backgroundImageUrl,
      }),
      ...(body.address !== undefined && {
        address: body.address === "" ? null : body.address,
      }),
      ...(body.phone !== undefined && {
        phone: body.phone === "" ? null : body.phone,
      }),
      ...(body.locationName !== undefined && {
        locationName: body.locationName === "" ? null : body.locationName,
      }),
      ...(body.latitude !== undefined && { latitude: body.latitude }),
      ...(body.longitude !== undefined && { longitude: body.longitude }),
    },
  });
  return NextResponse.json(updated);
}
