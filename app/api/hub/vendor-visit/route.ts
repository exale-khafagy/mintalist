import { NextResponse } from "next/server";
import { isHubAdmin } from "@/lib/hub-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const tierValues = ["FREE", "PAID_1", "PAID_2"] as const;

export async function POST(req: Request) {
  const allowed = await isHubAdmin();
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    employeeName?: string;
    employeeEmail?: string;
    businessName?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    locationName?: string;
    agreedTier?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const employeeName = body.employeeName?.trim();
  const employeeEmail = body.employeeEmail?.trim();
  const businessName = body.businessName?.trim();
  const contactName = body.contactName?.trim();
  const contactPhone = body.contactPhone?.trim();

  if (!employeeName || !employeeEmail || !businessName || !contactName || !contactPhone) {
    return NextResponse.json(
      { error: "employeeName, employeeEmail, businessName, contactName, contactPhone are required" },
      { status: 400 }
    );
  }

  const agreedTier = body.agreedTier?.trim().toUpperCase();
  if (!agreedTier || !tierValues.includes(agreedTier as (typeof tierValues)[number])) {
    return NextResponse.json(
      { error: "agreedTier must be FREE, PAID_1, or PAID_2" },
      { status: 400 }
    );
  }

  try {
    const visit = await prisma.vendorVisit.create({
      data: {
        employeeName,
        employeeEmail,
        businessName,
        contactName,
        contactPhone,
        contactEmail: body.contactEmail?.trim() || undefined,
        address: body.address?.trim() || undefined,
        locationName: body.locationName?.trim() || undefined,
        agreedTier: agreedTier as "FREE" | "PAID_1" | "PAID_2",
        notes: body.notes?.trim() || undefined,
      },
    });
    return NextResponse.json({
      ok: true,
      id: visit.id,
      businessName: visit.businessName,
    });
  } catch (e) {
    console.error("Vendor visit create error:", e);
    return NextResponse.json({ error: "Failed to save visit" }, { status: 500 });
  }
}
