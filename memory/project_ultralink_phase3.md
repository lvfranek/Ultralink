---
name: project-ultralink-phase3
description: Phase 3 complete — Analytics (events table, server-side capture, redirector, Pro-gated dashboard)
metadata:
  type: project
---

Phase 3 done. Build passes clean.

**Why:** Adding server-side analytics with no client JS — can't be ad-blocked.

**How to apply:** Next phase is 4 — Stripe billing. Do NOT start Phase 4 unless instructed.

## SQL to run in Supabase

```sql
create table public.events (
  id            bigserial primary key,
  page_id       uuid not null references public.pages(id) on delete cascade,
  link_id       uuid     references public.page_links(id) on delete cascade,
  kind          text not null check (kind in ('view','click')),
  country       text,
  device        text not null check (device in ('mobile','tablet','desktop','bot','unknown')),
  referrer_host text,
  created_at    timestamptz not null default now()
);

create index events_page_created_idx on public.events (page_id, created_at desc);
create index events_page_kind_created_idx on public.events (page_id, kind, created_at desc);
create index events_link_created_idx on public.events (link_id, created_at desc) where link_id is not null;

alter table public.events enable row level security;
create policy "events_owner_read" on public.events for select
  using (exists (select 1 from public.pages p where p.id = page_id and p.owner_id = auth.uid()));
```

To test the Pro dashboard: manually set `profiles.plan = 'pro'` for your user in Supabase.

## New files

- `src/lib/supabase/service.ts` — service-role client (bypasses RLS for event inserts)
- `src/lib/analytics.ts` — `captureEvent()`: UA device parsing, referrer normalization, service-role insert
- `src/lib/config/referrers.ts` — host → friendly label map + `getReferrerLabel()`
- `src/lib/countries.ts` — full ISO 3166-1 alpha-2 → country name map + `flagEmoji()`
- `src/app/r/[link_id]/route.ts` — GET redirector: lookup link → capture click → 302 to real URL (identical for bots/humans, no cloaking)
- `src/app/actions/analytics.ts` — `getAnalyticsData()` + `getUserPages()` server actions
- `src/app/(dashboard)/dashboard/analytics/analytics-client.tsx` — full Pro dashboard (tiles, activity chart, countries, sources donut, devices, top links)

## Modified files

- `src/lib/supabase/types.ts` — added `Event`, `DeviceType`, `EventKind`; added `"pro"` to `Plan` union
- `src/lib/config/pricing.ts` — added `planHasAnalytics(plan)` → `plan === 'pro'`
- `src/app/[slug]/page.tsx` — reads headers before render, registers `after()` view capture
- `src/components/public/profile-page-view.tsx` — `LinkButton` href changed to `/r/${link.id}` (preview mode still uses raw URL); 18+ gate also navigates via `/r/<id>`
- `src/components/dashboard/sidebar.tsx` — Analytics `disabled: false`, SOON badge removed
- `src/app/(dashboard)/dashboard/analytics/page.tsx` — plan check; renders `<UpgradeGate>` for non-Pro or `<AnalyticsDashboard>` for Pro

## Key design decisions

- Device detection: inline regex (no ua-parser-js dep)
- Bot UA check: `device='bot'` written, excluded from all dashboard queries
- No IP storage: country from `x-vercel-ip-country` header only
- `after()` usage: headers read before registration in Server Component; freely readable inside Route Handler after()
- Analytics data queries use user-session Supabase client (RLS enforces ownership)
- Event inserts use service-role client (no insert RLS policy)
- Recharts 3.9.0 (React 19 compatible)
