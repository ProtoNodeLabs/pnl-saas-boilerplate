# pnl-saas-boilerplate

Production-ready Next.js SaaS starter with multi-tenant orgs, Stripe billing, and Clerk auth — wired and working out of the box.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth | Clerk v6 |
| Database | Prisma v6 + Neon (serverless Postgres) |
| Billing | Stripe v17 (subscriptions + webhooks) |
| Email | Resend |
| Styling | Tailwind CSS v3 + CSS variables |
| Components | Radix UI primitives + CVA |
| Language | TypeScript (strict) |

## Features

- **Multi-tenant organizations** — each user creates/joins orgs; org-scoped data isolation
- **Role-based access** — OWNER / ADMIN / MEMBER with enforced permission gates
- **Invite flow** — email invites with 7-day token expiry, upsert on accept
- **Stripe billing** — checkout sessions, customer portal, webhook handler for full subscription lifecycle
- **Transactional email** — Resend integration for invite emails
- **Org switcher** — switch between orgs from the nav without page reload
- **Type-safe throughout** — Prisma-generated types flow end-to-end

## Folder Structure

```
app/
  (auth)/           # sign-in, sign-up (no shell)
  (dashboard)/      # layout.tsx wraps all authed routes in NavShell
    dashboard/      # overview stats + quick links
    settings/       # org info + members list + invite dialog
    billing/        # plan card + upgrade / portal buttons
  onboarding/       # org creation — redirects here when user has no orgs
  invite/[token]/   # public invite accept flow
  api/
    orgs/           # POST create org
    invites/        # POST send invite
    invites/[token]/accept/   # POST accept invite
    billing/checkout/         # POST create Stripe checkout session
    billing/portal/           # POST open billing portal
    webhooks/stripe/          # POST Stripe webhook handler

components/
  ui/               # button, badge, input, dialog, avatar, separator
  nav-shell.tsx     # sidebar with org switcher + nav links + user button
  org-switcher.tsx  # org dropdown
  member-list.tsx   # members table + pending invites + invite dialog
  billing-card.tsx  # plan status card with upgrade / manage actions

lib/
  db.ts             # Prisma singleton (hot-reload safe)
  stripe.ts         # Stripe client + checkout/portal helpers
  email.ts          # Resend wrapper + sendInviteEmail
  permissions.ts    # getCurrentMember, requireAdmin/Owner, canManage* helpers
  org.ts            # getUserOrgs, getOrgBySlug, createOrg, isActiveSubscription
  utils.ts          # cn, slugify, absoluteUrl

prisma/
  schema.prisma     # Organization, Member, Invite, Subscription models
```

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/ProtoNodeLabs/pnl-saas-boilerplate.git
cd pnl-saas-boilerplate
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in all values — see [Environment Variables](#environment-variables) below.

### 3. Set up the database

Create a Neon project at [neon.tech](https://neon.tech), copy the connection string, then:

```bash
npx prisma db push
npx prisma generate
```

### 4. Configure Clerk

- Create an application at [clerk.com](https://clerk.com)
- Set **Sign-in redirect URL** → `/dashboard`
- Set **Sign-up redirect URL** → `/onboarding`
- Copy the publishable key and secret key

### 5. Configure Stripe

- Create products/prices in your [Stripe dashboard](https://dashboard.stripe.com)
- Copy the price ID for your Pro plan
- For webhooks (local): `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Events to enable: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### 6. Configure Resend

- Add a sending domain at [resend.com](https://resend.com)
- Create an API key scoped to that domain

### 7. Run

```bash
npm run dev
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...

# Resend
RESEND_API_KEY=re_...
FROM_EMAIL=hello@yourdomain.com
FROM_NAME=Your App

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=Your App
```

## Auth Flow

1. `/sign-up` → Clerk handles registration → redirects to `/onboarding`
2. `/onboarding` → user creates their first org → redirects to `/dashboard?org={slug}`
3. Subsequent sign-ins → `/dashboard` → dashboard layout reads orgs from DB; if none, redirects back to `/onboarding`

Middleware at `middleware.ts` guards all routes except `/`, `/sign-in`, `/sign-up`, `/invite/*`, and `/api/webhooks/*`.

## Billing Flow

1. Free users see "Upgrade to Pro" → `POST /api/billing/checkout` → Stripe Checkout
2. `checkout.session.completed` webhook → subscription record set to `ACTIVE`
3. Active users see "Manage subscription" → `POST /api/billing/portal` → Stripe Customer Portal
4. Subscription changes/cancellations sync via `customer.subscription.updated` / `customer.subscription.deleted`
5. Failed payments → `invoice.payment_failed` → status set to `PAST_DUE`

## Invite Flow

1. ADMIN or OWNER clicks Invite → `POST /api/invites` → Resend delivers email with token link
2. Recipient visits `/invite/[token]` → if authenticated: Accept button → `POST /api/invites/[token]/accept`
3. Not authenticated → sign-in/up links with redirect back to invite URL
4. Accept creates Member record (upsert) and marks invite accepted in a DB transaction
5. Invites expire after 7 days

## Deploy

### Vercel

```bash
npx vercel --prod
```

Set all environment variables in the Vercel project dashboard or via CLI:

```bash
npx vercel env add DATABASE_URL production --value 'your-value' --yes
```

After deploy, update your Stripe webhook endpoint to `https://yourdomain.com/api/webhooks/stripe`.

## Customization

- **Swap email templates** — `lib/email.ts` sends a plain-text invite by default. Replace with a `react-email` template by importing your component and passing it to `resend.emails.send({ react: <YourTemplate /> })`.
- **Add Pro features** — gate any server component or API route with `isActiveSubscription(org)` from `lib/org.ts`.
- **Extend roles** — add values to the `Role` enum in `prisma/schema.prisma` and update the permission helpers in `lib/permissions.ts`.
- **Add org settings** — the `Organization` model has `name` and `slug`; extend the schema and add a `PATCH /api/orgs/[slug]` route.

## License

MIT
