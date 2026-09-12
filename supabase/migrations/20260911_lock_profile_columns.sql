-- Lock down which profile columns users can write themselves.
--
-- The "profiles_own_update" RLS policy only checks WHICH ROW a user may
-- update (their own) — not which COLUMNS. Because billing fields live on the
-- same row, a signed-in user could set their own subscription_status to
-- 'active' straight from the browser and unlock Pro without paying.
--
-- RLS decides rows; GRANTs decide columns. Here we take away the blanket
-- write permission and hand back only the harmless, user-editable columns.
-- Billing columns (subscription_status, plan_tier, stripe_customer_id, ...)
-- can now only be written by the server with the service-role key
-- (Stripe webhook + billing actions), which bypasses these grants.

revoke insert, update on public.profiles from anon, authenticated;

grant update (username, display_name, has_seen_welcome)
  on public.profiles to authenticated;

grant insert (id, username, display_name)
  on public.profiles to authenticated;
