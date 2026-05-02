"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";

interface Org {
  id: string;
  name: string;
  slug: string;
  role: Role;
}

export function OrgSwitcher({
  orgs,
  currentSlug,
}: {
  orgs: Org[];
  currentSlug: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const current = orgs.find((o) => o.slug === currentSlug) ?? orgs[0];

  if (!current) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
            {current.name.charAt(0).toUpperCase()}
          </div>
          <span className="truncate max-w-[120px]">{current.name}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-md border bg-white shadow-md">
            <div className="p-1">
              {orgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/dashboard?org=${org.slug}`);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm",
                    org.slug === currentSlug
                      ? "bg-accent font-medium"
                      : "hover:bg-accent/50"
                  )}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[9px] font-bold text-primary">
                    {org.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{org.name}</span>
                </button>
              ))}
            </div>
            <div className="border-t p-1">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/onboarding");
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent/50"
              >
                <Plus className="h-4 w-4" />
                New organization
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
