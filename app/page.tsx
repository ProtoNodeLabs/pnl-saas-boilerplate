import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function LandingPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Your SaaS";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center rounded-full border bg-white px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
          Built with pnl-saas-boilerplate
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900">
          {appName}
        </h1>

        <p className="mb-10 text-lg text-muted-foreground">
          A production-ready multi-tenant SaaS starter. Swap the name, fill in
          your env vars, and ship.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <SignedOut>
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get started free
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex h-11 items-center justify-center rounded-md border bg-white px-8 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent"
            >
              Sign in
            </Link>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Go to dashboard →
            </Link>
          </SignedIn>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
          {[
            {
              title: "Multi-tenant orgs",
              desc: "Organizations with owner / admin / member roles, invites, and slug-based routing.",
            },
            {
              title: "Stripe billing",
              desc: "Checkout sessions, webhook handler, subscription status synced to your DB.",
            },
            {
              title: "Clerk auth",
              desc: "Sign in, sign up, and user management — fully wired with protected routes.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="mb-1.5 font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
