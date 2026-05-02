import { getUserOrgs } from "@/lib/org";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { org: orgSlug } = await searchParams;
  const orgs = await getUserOrgs();
  const activeOrg = orgSlug
    ? orgs.find((o) => o.slug === orgSlug)
    : orgs[0];

  if (!activeOrg) redirect("/onboarding");

  const [memberCount, pendingInvites] = await Promise.all([
    db.member.count({ where: { organizationId: activeOrg.id } }),
    db.invite.count({
      where: { organizationId: activeOrg.id, acceptedAt: null, expiresAt: { gt: new Date() } },
    }),
  ]);

  const isActive =
    activeOrg.subscription?.status === "ACTIVE" ||
    activeOrg.subscription?.status === "TRIALING";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{activeOrg.name}</h1>
        <p className="text-muted-foreground">/{activeOrg.slug}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Members" value={memberCount} />
        <StatCard label="Pending invites" value={pendingInvites} />
        <StatCard
          label="Plan"
          value={isActive ? "Pro" : "Free"}
          badge={isActive}
        />
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Quick links</h2>
        <div className="space-y-2 text-sm">
          <QuickLink href={`/settings?org=${activeOrg.slug}`} label="Organization settings" />
          <QuickLink href={`/settings/members?org=${activeOrg.slug}`} label="Manage members" />
          <QuickLink href={`/billing?org=${activeOrg.slug}`} label="Billing & subscription" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  badge,
}: {
  label: string;
  value: string | number;
  badge?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {badge && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            active
          </span>
        )}
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center justify-between rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50"
    >
      <span>{label}</span>
      <span className="text-muted-foreground">→</span>
    </a>
  );
}
