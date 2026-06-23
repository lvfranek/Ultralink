-- Phase 2B migration
-- Run this in the Supabase SQL editor

-- pages: profile display + active badge
alter table public.pages
  add column if not exists avatar_style text not null default 'circle',
  add column if not exists active_badge boolean not null default false;

-- page_links: per-link icon, thumbnail, adult flag
alter table public.page_links
  add column if not exists icon text,
  add column if not exists thumbnail_url text,
  add column if not exists is_adult boolean not null default false;

-- socials (icon row under the profile; up to 20 enforced in app code)
create table if not exists public.page_socials (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  platform text not null,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.page_socials enable row level security;

create policy "page_socials_owner_all" on public.page_socials for all
  using (exists (select 1 from public.pages p where p.id = page_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.pages p where p.id = page_id and p.owner_id = auth.uid()));

create policy "page_socials_public_read" on public.page_socials for select
  using (exists (select 1 from public.pages p where p.id = page_id and p.is_active = true));
