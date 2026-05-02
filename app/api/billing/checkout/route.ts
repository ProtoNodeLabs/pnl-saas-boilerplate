import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getOrCreateStripeCustomer, createCheckoutSession } from "@/lib/stripe";
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

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  const customerId = await getOrCreateStripeCustomer(org, email);

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Stripe price ID not configured" }, { status: 500 });
  }

  const session = await createCheckoutSession({
    customerId,
    priceId,
    orgId,
    returnUrl: absoluteUrl(`/billing?org=${org.slug}`),
  });

  return NextResponse.json({ url: session.url });
}
