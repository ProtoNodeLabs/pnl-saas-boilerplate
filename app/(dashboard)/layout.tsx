import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserOrgs } from "@/lib/org";
import { NavShell } from "@/components/nav-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const orgs = await getUserOrgs();

  if (orgs.length === 0) redirect("/onboarding");

  return <NavShell orgs={orgs}>{children}</NavShell>;
}
