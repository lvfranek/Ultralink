-- Enforce each plan's page ("link page") limit in the database, not just in
-- the app. Until now, `createPage`/`duplicatePage` counted existing pages
-- and checked the cap in TypeScript before inserting — but a signed-in user
-- can call the Supabase REST/JS API directly with their own session and
-- skip the app entirely (RLS only checks *ownership*, never *how many*).
--
-- Mirrors getLinkCap()/isProActive() in src/lib/config/pricing.ts and
-- src/lib/supabase/types.ts exactly — keep both in sync if the plan logic
-- ever changes.

create or replace function public.get_link_cap(p_owner_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  prof record;
  is_pro boolean;
begin
  select subscription_status, plan_tier, grace_period_ends_at
    into prof
    from public.profiles
    where id = p_owner_id;

  if not found then
    return 1;
  end if;

  is_pro := prof.subscription_status in ('active', 'trialing')
    or (prof.subscription_status = 'grace' and prof.grace_period_ends_at is not null and prof.grace_period_ends_at > now());

  if is_pro then
    return coalesce(prof.plan_tier, 1);
  end if;

  return 1;
end;
$$;

create or replace function public.enforce_page_link_cap()
returns trigger
language plpgsql
as $$
declare
  current_count integer;
  cap integer;
begin
  cap := public.get_link_cap(new.owner_id);

  select count(*) into current_count
    from public.pages
    where owner_id = new.owner_id;

  if current_count >= cap then
    raise exception 'Plan limit reached: % page(s) allowed on the current plan.', cap
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_page_link_cap on public.pages;
create trigger enforce_page_link_cap
  before insert on public.pages
  for each row execute function public.enforce_page_link_cap();
