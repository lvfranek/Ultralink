-- Phase 2A: profiles, pages, page_links
-- Run this in Supabase Dashboard → SQL Editor

-- =========================================================
-- PROFILES (1:1 with auth.users; holds the plan)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_own_read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_own_update"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- PAGES (each = one bio page, e.g. ultralink.bio/kait)
-- =========================================================
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  title text not null default '',
  bio text default '',
  avatar_url text,
  template text not null default 'classic',
  theme jsonb not null default '{}'::jsonb,
  age_gate_enabled boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint slug_format check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$')
);

alter table public.pages enable row level security;

create policy "pages_owner_all"
  on public.pages for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "pages_public_read"
  on public.pages for select
  using (is_active = true);

-- =========================================================
-- PAGE_LINKS (buttons inside a page)
-- =========================================================
create table public.page_links (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  label text not null default '',
  url text not null default '',
  position int not null default 0,
  layout text not null default 'classic',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.page_links enable row level security;

create policy "page_links_owner_all"
  on public.page_links for all
  using (
    exists (
      select 1 from public.pages p
      where p.id = page_id and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pages p
      where p.id = page_id and p.owner_id = auth.uid()
    )
  );

create policy "page_links_public_read"
  on public.page_links for select
  using (
    is_active = true and
    exists (
      select 1 from public.pages p
      where p.id = page_id and p.is_active = true
    )
  );
