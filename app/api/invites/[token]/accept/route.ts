import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await params;

  const invite = await db.invite.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (invite.acceptedAt) return NextResponse.json({ error: "Invite already accepted" }, { status: 409 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Invite expired" }, { status: 410 });

  // Upsert membership — if user is already a member, just update their role if the invite grants higher
  await db.$transaction([
    db.member.upsert({
      where: { userId_organizationId: { userId, organizationId: invite.organizationId } },
      create: { userId, organizationId: invite.organizationId, role: invite.role },
      update: { role: invite.role },
    }),
    db.invite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ slug: invite.organization.slug });
}
