import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/permissions";
import { sendInviteEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/utils";
import { Role } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  orgId: z.string(),
  role: z.nativeEnum(Role).optional().default(Role.MEMBER),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 422 });
  }

  const { email, orgId, role } = parsed.data;

  // Only admins/owners can invite
  const member = await requireAdmin(orgId).catch(() => null);
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Check for existing active invite
  const existing = await db.invite.findFirst({
    where: { email, organizationId: orgId, acceptedAt: null, expiresAt: { gt: new Date() } },
  });
  if (existing) {
    return NextResponse.json({ error: "An active invite already exists for this email" }, { status: 409 });
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await db.invite.create({
    data: { email, organizationId: orgId, role, expiresAt },
    include: { organization: true },
  });

  const inviteUrl = absoluteUrl(`/invite/${invite.token}`);

  await sendInviteEmail({
    to: email,
    inviterName: member.organization.name,
    orgName: invite.organization.name,
    inviteUrl,
  }).catch((err) => console.error("Failed to send invite email:", err));

  return NextResponse.json({ id: invite.id }, { status: 201 });
}
