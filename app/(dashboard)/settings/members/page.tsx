import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserOrgs } from "@/lib/org";
import { db } from "@/lib/db";
import { MemberList } from "@/components/member-list";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { org: orgSlug } = await searchParams;
  const orgs = await getUserOrgs();
  const activeOrg = orgSlug ? orgs.find((o) => o.slug === orgSlug) : orgs[0];

  if (!activeOrg) redirect("/onboarding");

  const [members, invites] = await Promise.all([
    db.member.findMany({
      where: { organizationId: activeOrg.id },
      orderBy: { createdAt: "asc" },
    }),
    db.invite.findMany({
      where: {
        organizationId: activeOrg.id,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const user = await currentUser();
  const currentMember = members.find((m) => m.userId === userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <p className="text-muted-foreground">
          {members.length} member{members.length !== 1 ? "s" : ""} in{" "}
          {activeOrg.name}
        </p>
      </div>

      <MemberList
        members={members}
        invites={invites}
        currentUserId={userId}
        currentRole={currentMember?.role ?? "MEMBER"}
        orgId={activeOrg.id}
        orgSlug={activeOrg.slug}
      />
    </div>
  );
}
