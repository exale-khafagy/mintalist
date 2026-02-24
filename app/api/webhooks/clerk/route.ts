import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { WebhookEvent } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import { randomSlug } from "@/lib/slug";

function getWebhookSecret(): string {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "Missing CLERK_WEBHOOK_SECRET. Add it in the Clerk Dashboard under Webhooks → Signing Secret."
    );
  }
  return secret;
}

/**
 * Get the primary email address from the Clerk user webhook payload.
 */
function getPrimaryEmail(evt: WebhookEvent): string | null {
  if (evt.type !== "user.created") return null;

  const data = evt.data as {
    primary_email_address_id?: string | null;
    email_addresses?: Array<{ id: string; email_address: string }>;
  };

  const primaryId = data.primary_email_address_id;
  const emails = data.email_addresses ?? [];

  if (primaryId) {
    const primary = emails.find((e) => e.id === primaryId);
    if (primary?.email_address) return primary.email_address;
  }

  // Fallback: first email in the list
  const first = emails[0];
  return first?.email_address ?? null;
}

async function generateUniqueSlug(): Promise<string> {
  let slug = randomSlug(8);
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.vendor.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = randomSlug(8);
  }
  return `vendor-${Date.now().toString(36)}`;
}

export async function POST(req: Request) {
  const body = await req.text();
  const headerStore = await headers();

  const svixId = headerStore.get("svix-id");
  const svixTimestamp = headerStore.get("svix-timestamp");
  const svixSignature = headerStore.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse("Missing Svix headers", { status: 400 });
  }

  const wh = new Webhook(getWebhookSecret());

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (evt.type !== "user.created") {
    return new NextResponse("OK", { status: 200 });
  }

  const clerkUserId = evt.data.id;
  const primaryEmail = getPrimaryEmail(evt);

  const slug = await generateUniqueSlug();

  try {
    await prisma.vendor.create({
      data: {
        clerkUserId,
        name: "New Vendor",
        slug,
        tier: "FREE",
        // primaryEmail not stored on Vendor in Phase 1; available for logging/debug if needed
      },
    });
  } catch (error) {
    console.error("Error creating Vendor for user.created:", error);
    return new NextResponse("Error syncing vendor", { status: 500 });
  }

  return new NextResponse("OK", { status: 200 });
}
