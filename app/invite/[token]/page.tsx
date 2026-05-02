import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import Link from "next/link";
import { AcceptInviteButton } from "./accept-invite-button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await db.invite.findUnique({
    where: { token },
    include: { organization: true },
  });

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
          <h1 className="mb-2 text-xl font-bold text-gray-900">
            Invite not found
          </h1>
          <p className="mb-6 text-muted-foreground">
            This invite link has expired or already been used.
          </p>
          <Link
            href="/"
            className="text-sm text-primary underline underline-offset-4"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const { userId } = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-bold text-gray-900">
          You've been invited
        </h1>
        <p className="mb-6 text-muted-foreground">
          Join <strong>{invite.organization.name}</strong> as a{" "}
          {invite.role.toLowerCase()}.
        </p>

        {userId ? (
          <AcceptInviteButton token={token} orgSlug={invite.organization.slug} />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Sign in or create an account to accept this invitation.
            </p>
            <Link
              href={`/sign-up?redirect_url=/invite/${token}`}
              className="block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create account
            </Link>
            <Link
              href={`/sign-in?redirect_url=/invite/${token}`}
              className="block w-full rounded-md border px-4 py-2 text-center text-sm font-medium hover:bg-accent"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
