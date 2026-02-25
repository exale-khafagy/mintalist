import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { randomSlug } from "@/lib/slug";

const bodySchema = z.object({
  name: z.string().min(2).optional(),
  brandColor: z.string().regex(/^#([0-9a-fA-F]{6})$/).optional(),
  logoUrl: z.union([z.string().url(), z.literal("")]).optional(),
  locationName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  planPreference: z.enum(["FREE_ALWAYS", "GOLD_1_MONTH", "PLATINUM_2_WEEKS"]).optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let existing = await prisma.vendor.findUnique({
    where: { clerkUserId: userId },
  });

  if (!existing) {
    const name = body.name?.trim() || "New Vendor";
    let slug = randomSlug(8);
    let attempts = 0;
    while (attempts < 5) {
      const taken = await prisma.vendor.findUnique({ where: { slug } });
      if (!taken) break;
      slug = randomSlug(8);
      attempts++;
    }
    existing = await prisma.vendor.create({
      data: {
        clerkUserId: userId,
        name,
        slug,
        brandColor: body.brandColor ?? "#10B981",
        tier: "FREE",
        logoUrl: body.logoUrl?.trim() || null,
        locationName: body.locationName?.trim() || null,
        address: body.address?.trim() || null,
        phone: body.phone?.trim() || null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        planPreference: body.planPreference ?? null,
      },
    });
    return NextResponse.json({ ok: true, vendorId: existing.id });
  }

  const updateData: {
    name?: string;
    brandColor?: string;
    logoUrl?: string | null;
    locationName?: string | null;
    address?: string | null;
    phone?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    planPreference?: string | null;
  } = {};
  if (body.name !== undefined) updateData.name = body.name.trim();
  if (body.brandColor !== undefined) updateData.brandColor = body.brandColor;
  if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl?.trim() || null;
  if (body.locationName !== undefined) updateData.locationName = body.locationName?.trim() || null;
  if (body.address !== undefined) updateData.address = body.address?.trim() || null;
  if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null;
  if (body.latitude !== undefined) updateData.latitude = body.latitude ?? null;
  if (body.longitude !== undefined) updateData.longitude = body.longitude ?? null;
  if (body.planPreference !== undefined) updateData.planPreference = body.planPreference ?? null;

  await prisma.vendor.update({
    where: { clerkUserId: userId },
    data: updateData,
  });

  return NextResponse.json({ ok: true });
}
