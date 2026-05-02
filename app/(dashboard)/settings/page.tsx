import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserOrgs } from "@/lib/org";

export default async function SettingsPage({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-muted-foreground">Manage your organization settings.</p>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-gray-900">Organization</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              defaultValue={activeOrg.name}
              readOnly
              className="w-full max-w-md rounded-md border border-input bg-gray-50 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Name changes coming soon.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Slug
            </label>
            <div className="flex max-w-md items-center rounded-md border border-input bg-gray-50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">/</span>
              <span className="ml-1">{activeOrg.slug}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Used in URLs. Cannot be changed.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Created
            </label>
            <p className="text-sm text-muted-foreground">
              {new Date(activeOrg.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
