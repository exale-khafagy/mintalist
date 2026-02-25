import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SLUG_REGEX = /^[a-z0-9-]+$/;
const MIN_SLUG_LENGTH = 2;

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug")?.toLowerCase().trim();

  if (!slug) {
    return NextResponse.json(
      { error: "slug query parameter required" },
      { status: 400 }
    );
  }

  if (slug.length < MIN_SLUG_LENGTH || !SLUG_REGEX.test(slug)) {
    return NextResponse.json({ available: false }, { status: 200 });
  }

  const currentVendor = await prisma.vendor.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, slug: true },
  });

  if (currentVendor?.slug === slug) {
    return NextResponse.json({ available: true }, { status: 200 });
  }

  const taken = await prisma.vendor.findFirst({
    where: { slug },
    select: { id: true },
  });

  return NextResponse.json(
    { available: !taken },
    { status: 200 }
  );
}
