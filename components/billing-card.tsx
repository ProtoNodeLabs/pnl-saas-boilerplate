"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink } from "lucide-react";
import type { Organization, Subscription } from "@prisma/client";

type OrgWithSub = Organization & { subscription: Subscription | null };

export function BillingCard({
  org,
  orgSlug,
}: {
  org: OrgWithSub;
  orgSlug: string;
}) {
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState("");

  const sub = org.subscription;
  const isActive = sub?.status === "ACTIVE" || sub?.status === "TRIALING";
  const isCanceling = sub?.cancelAtPeriodEnd;

  async function startCheckout() {
    setLoading("checkout");
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  async function openPortal() {
    setLoading("portal");
    setError("");
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: org.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to open portal");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Current plan */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold text-gray-900">
                {isActive ? "Pro plan" : "Free plan"}
              </h2>
              {sub?.status && (
                <Badge
                  variant={
                    isActive ? "success" : sub.status === "PAST_DUE" ? "destructive" : "outline"
                  }
                >
                  {sub.status.toLowerCase().replace("_", " ")}
                </Badge>
              )}
            </div>

            {isActive && sub?.currentPeriodEnd && (
              <p className="mt-1 text-sm text-muted-foreground">
                {isCanceling
                  ? `Cancels on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`
                  : `Renews on ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`}
              </p>
            )}

            {!isActive && (
              <p className="mt-1 text-sm text-muted-foreground">
                Upgrade to Pro for unlimited members and premium features.
              </p>
            )}
          </div>

          <div>
            {isActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={openPortal}
                disabled={loading === "portal"}
              >
                <ExternalLink className="h-4 w-4" />
                {loading === "portal" ? "Opening…" : "Manage subscription"}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={startCheckout}
                disabled={loading === "checkout"}
              >
                {loading === "checkout" ? "Redirecting…" : "Upgrade to Pro"}
              </Button>
            )}
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>

      {/* Feature comparison */}
      {!isActive && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Pro plan includes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Unlimited members",
              "Priority support",
              "Advanced analytics",
              "Custom roles",
              "Audit log",
              "SSO (coming soon)",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <Button className="mt-5 w-full" onClick={startCheckout} disabled={loading === "checkout"}>
            {loading === "checkout" ? "Redirecting…" : "Upgrade now"}
          </Button>
        </div>
      )}
    </div>
  );
}
