-- Fix: new Google sign-ups failed with "Database error saving new user".
--
-- handle_new_user() read the username from the sign-up metadata, which only
-- the email form sends. Google (OAuth) sign-ups have no username there, so
-- the insert hit the NOT NULL constraint on profiles.username and Supabase
-- rejected the whole sign-up.
--
-- Now: use the requested username if it's valid, otherwise generate one from
-- the email address (users can rename it in Account settings).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested text := lower(new.raw_user_meta_data->>'username');
  base text;
  candidate text;
begin
  if requested ~ '^[a-z0-9_]{3,20}$' then
    candidate := requested;
  else
    -- "Jane.Doe+work@gmail.com" -> "janedoework" (max 15 chars, room for a suffix)
    base := left(
      regexp_replace(lower(split_part(coalesce(new.email, ''), '@', 1)), '[^a-z0-9_]', '', 'g'),
      15
    );
    if length(base) < 3 then
      base := 'user';
    end if;

    candidate := base;
    while exists (select 1 from public.profiles where username = candidate) loop
      candidate := base || '_' || substr(md5(random()::text), 1, 4);
    end loop;
  end if;

  insert into public.profiles (id, display_name, username)
  values (new.id, new.raw_user_meta_data->>'name', candidate);
  return new;
end;
$$;

-- Enforce the username format in the database, not just in the app.
-- Usernames are inserted into invite email HTML, and users can write this
-- column directly via the API, so the app-side check alone isn't enough.
-- If this fails, an existing row has an invalid username — fix it first:
--   select id, username from public.profiles where username !~ '^[a-z0-9_]{3,20}$';
alter table public.profiles
  add constraint profiles_username_format
  check (username ~ '^[a-z0-9_]{3,20}$');
