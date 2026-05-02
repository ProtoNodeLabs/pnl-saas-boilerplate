import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserOrgs } from "@/lib/org";
import { BillingCard } from "@/components/billing-card";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; upgraded?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { org: orgSlug, upgraded } = await searchParams;
  const orgs = await getUserOrgs();
  const activeOrg = orgSlug ? orgs.find((o) => o.slug === orgSlug) : orgs[0];

  if (!activeOrg) redirect("/onboarding");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment details.
        </p>
      </div>

      {upgraded === "true" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          🎉 You're now on the Pro plan. Thanks for upgrading!
        </div>
      )}

      <BillingCard org={activeOrg} orgSlug={activeOrg.slug} />
    </div>
  );
}
