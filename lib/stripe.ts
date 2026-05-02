import Stripe from "stripe";
import { db } from "@/lib/db";
import type { Organization } from "@prisma/client";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export async function getOrCreateStripeCustomer(
  org: Organization,
  email: string
): Promise<string> {
  const existing = await db.subscription.findUnique({
    where: { organizationId: org.id },
    select: { stripeCustomerId: true },
  });

  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    name: org.name,
    metadata: { organizationId: org.id },
  });

  await db.subscription.upsert({
    where: { organizationId: org.id },
    create: {
      organizationId: org.id,
      stripeCustomerId: customer.id,
    },
    update: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession({
  customerId,
  priceId,
  orgId,
  returnUrl,
}: {
  customerId: string;
  priceId: string;
  orgId: string;
  returnUrl: string;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${returnUrl}?upgraded=true`,
    cancel_url: returnUrl,
    metadata: { organizationId: orgId },
    subscription_data: {
      metadata: { organizationId: orgId },
    },
    allow_promotion_codes: true,
  });
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
