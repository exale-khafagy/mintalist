import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  isAvailable: z.boolean().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({
    where: { clerkUserId: userId },
    include: { menuItems: { orderBy: { name: "asc" } } },
  });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  return NextResponse.json(vendor.menuItems);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vendor = await prisma.vendor.findUnique({
    where: { clerkUserId: userId },
  });
  if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  let body: z.infer<typeof createItemSchema>;
  try {
    const raw = await req.json();
    body = createItemSchema.parse({
      ...raw,
      price: typeof raw.price === "string" ? parseFloat(raw.price) : raw.price,
    });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: {
      vendorId: vendor.id,
      name: body.name,
      description: body.description ?? null,
      price: body.price,
      isAvailable: body.isAvailable ?? true,
    },
  });
  return NextResponse.json(item);
}
