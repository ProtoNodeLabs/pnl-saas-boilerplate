import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { createBillingPortalSession } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({ orgId: z.string() });

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 422 });
  }

  const { orgId } = parsed.data;

  const sub = await db.subscription.findUnique({ where: { organizationId: orgId } });
  if (!sub?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const session = await createBillingPortalSession(
    sub.stripeCustomerId,
    absoluteUrl(`/billing?org=${org.slug}`)
  );

  return NextResponse.json({ url: session.url });
}
