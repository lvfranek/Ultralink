-- Polish batch 3b migration
-- Run this in the Supabase SQL editor

-- profiles: track whether the user has dismissed the first-login welcome modal
alter table public.profiles
  add column if not exists has_seen_welcome boolean not null default false;
