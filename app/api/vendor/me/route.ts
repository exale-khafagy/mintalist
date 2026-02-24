import { NextResponse } from "next/server";

import { getCurrentVendor } from "@/lib/auth";

export async function GET() {
  const vendor = await getCurrentVendor();
  if (!vendor) {
    return NextResponse.json({ error: "Unauthorized or no vendor" }, { status: 401 });
  }
  return NextResponse.json(vendor);
}
