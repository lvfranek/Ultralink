---
name: project-ultralink-phase4
description: Phase 4 Stripe billing — subscription gating, checkout, webhooks, enforcement, grace period
metadata:
  type: project
---

Phase 4 Stripe billing is complete and passing `npm run build`.

**Key files added:**
- `src/lib/stripe/server.ts` — lazy-init Stripe client (Proxy pattern avoids build-time crash)
- `src/lib/stripe/prices.ts` — `getPriceId(tier, interval)` reads from env vars
- `src/app/actions/billing.ts` — `startCheckout`, `createCheckoutSession`, `createPortalSession`
- `src/app/api/stripe/webhook/route.ts` — handles 5 Stripe events, uses service-role Supabase
- `src/app/checkout/route.ts` — GET route for post-login checkout redirect (`/checkout?tier=X&interval=Y`)
- `src/app/(dashboard)/dashboard/analytics/analytics-upgrade-cta.tsx` — modal with tier/interval picker

**Key files updated:**
- `src/lib/supabase/types.ts` — new Profile fields + `getEffectivePlan` + `isProActive` helpers
- `src/lib/config/pricing.ts` — `TIERS`, `getLinkCap(profile)`, `planHasAnalytics(profile)` now take Profile
- `src/app/[slug]/page.tsx` — enforcement: lapsed Pro users get only their oldest page
- `src/app/actions/pages.ts` — createPage queries subscription fields
- `src/components/dashboard/dashboard-shell.tsx` — grace/canceled banners, upgraded=1 banner
- `src/components/dashboard/links-list.tsx` — Hidden badge for lapsed pages
- `src/components/marketing/pricing.tsx` — "Get Pro" calls `startCheckout` server action

**SQL to run in Supabase:**
```sql
alter table public.profiles
  add column if not exists stripe_customer_id text unique,
  add column if not exists stripe_subscription_id text unique,
  add column if not exists plan_tier int,
  add column if not exists plan_interval text
    check (plan_interval is null or plan_interval in ('monthly','annual')),
  add column if not exists subscription_status text not null default 'none'
    check (subscription_status in ('none','active','trialing','past_due','canceled','grace')),
  add column if not exists grace_period_ends_at timestamptz,
  add column if not exists current_period_end timestamptz;

create index if not exists profiles_stripe_customer_idx on public.profiles (stripe_customer_id);
create index if not exists profiles_stripe_subscription_idx on public.profiles (stripe_subscription_id);
```

**Why:** Subscription enforcement — plan gating is now real via Stripe, not manual DB edits.
**How to apply:** Run the SQL above in Supabase SQL editor, then set all env vars from `.env.example` and deploy.
