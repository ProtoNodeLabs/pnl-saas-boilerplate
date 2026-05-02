import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function getCurrentMember(orgId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  return db.member.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
    include: { organization: true },
  });
}

export async function requireMember(orgId: string) {
  const member = await getCurrentMember(orgId);
  if (!member) throw new Error("Not a member of this organization");
  return member;
}

export async function requireAdmin(orgId: string) {
  const member = await requireMember(orgId);
  if (member.role === Role.MEMBER) throw new Error("Requires admin or owner role");
  return member;
}

export async function requireOwner(orgId: string) {
  const member = await requireMember(orgId);
  if (member.role !== Role.OWNER) throw new Error("Requires owner role");
  return member;
}

export function canManageMembers(role: Role) {
  return role === Role.OWNER || role === Role.ADMIN;
}

export function canManageBilling(role: Role) {
  return role === Role.OWNER;
}

export function canDeleteOrg(role: Role) {
  return role === Role.OWNER;
}
