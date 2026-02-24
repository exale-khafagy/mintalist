import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
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
  const item = await prisma.menuItem.findFirst({
    where: { id, vendorId: vendor.id },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: z.infer<typeof updateSchema>;
  try {
    const raw = await req.json();
    body = updateSchema.parse({
      ...raw,
      price: raw.price !== undefined ? (typeof raw.price === "string" ? parseFloat(raw.price) : raw.price) : undefined,
    });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const updated = await prisma.menuItem.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
    },
  });
  return NextResponse.json(updated);
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
  const item = await prisma.menuItem.findFirst({
    where: { id, vendorId: vendor.id },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.menuItem.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
