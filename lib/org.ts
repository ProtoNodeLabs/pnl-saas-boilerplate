import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { slugify } from "@/lib/utils";

export async function getUserOrgs() {
  const { userId } = await auth();
  if (!userId) return [];

  const memberships = await db.member.findMany({
    where: { userId },
    include: {
      organization: {
        include: { subscription: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return memberships.map((m) => ({ ...m.organization, role: m.role }));
}

export async function getOrgBySlug(slug: string) {
  return db.organization.findUnique({
    where: { slug },
    include: { subscription: true },
  });
}

export async function createOrg(name: string, ownerUserId: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 1;

  while (await db.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  return db.organization.create({
    data: {
      name,
      slug,
      members: {
        create: { userId: ownerUserId, role: Role.OWNER },
      },
    },
    include: { subscription: true },
  });
}

export function isActiveSubscription(status: string | null) {
  return status === "ACTIVE" || status === "TRIALING";
}
