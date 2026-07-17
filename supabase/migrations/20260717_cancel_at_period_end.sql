-- Track Stripe's cancel_at_period_end flag so the UI can distinguish
-- "will renew" from "canceled, access continues until period end"
-- without prematurely losing subscription_status = active/trialing (which
-- still gates Pro feature access).
alter table public.profiles
  add column if not exists cancel_at_period_end boolean not null default false;
