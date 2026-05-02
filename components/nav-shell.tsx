"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Users, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrgSwitcher } from "@/components/org-switcher";
import { Suspense } from "react";
import { Role } from "@prisma/client";

interface Org {
  id: string;
  name: string;
  slug: string;
  role: Role;
}

interface NavShellProps {
  children: React.ReactNode;
  orgs: Org[];
}

function NavContent({ orgs, children }: NavShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const orgSlug = searchParams.get("org") ?? orgs[0]?.slug ?? "";

  const nav = [
    { href: `/dashboard?org=${orgSlug}`, label: "Dashboard", icon: LayoutDashboard, match: "/dashboard" },
    { href: `/settings/members?org=${orgSlug}`, label: "Members", icon: Users, match: "/settings/members" },
    { href: `/settings?org=${orgSlug}`, label: "Settings", icon: Settings, match: "/settings" },
    { href: `/billing?org=${orgSlug}`, label: "Billing", icon: CreditCard, match: "/billing" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r bg-white">
        <div className="border-b p-4">
          <OrgSwitcher orgs={orgs} currentSlug={orgSlug} />
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.match ||
              (item.match === "/settings" &&
                pathname === "/settings" &&
                !pathname.startsWith("/settings/members"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl p-8">{children}</div>
      </main>
    </div>
  );
}

export function NavShell(props: NavShellProps) {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <NavContent {...props} />
    </Suspense>
  );
}
