import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getLinkCap } from "@/lib/config/pricing";
import type { SubscriptionStatus, PlanInterval } from "@/lib/supabase/types";
import { AccountSettingsClient } from "./account-settings-client";

export const metadata: Metadata = {
  title: "Account settings — Ultralink",
  robots: { index: false, follow: false },
};

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, pagesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, subscription_status, grace_period_ends_at, plan_tier, plan_interval, current_period_end, stripe_customer_id")
      .eq("id", user.id)
      .single(),
    supabase.from("pages").select("id", { count: "exact", head: true }).eq("owner_id", user.id),
  ]);

  const p = profileResult.data;
  const profile = {
    subscription_status: (p?.subscription_status ?? "none") as SubscriptionStatus,
    grace_period_ends_at: p?.grace_period_ends_at ?? null,
    plan_tier: p?.plan_tier ?? null,
    plan_interval: (p?.plan_interval ?? null) as PlanInterval | null,
    current_period_end: p?.current_period_end ?? null,
    stripe_customer_id: p?.stripe_customer_id ?? null,
  };

  const username = p?.username ?? "";
  const linkCap = getLinkCap(profile);
  const linksUsed = pagesResult.count ?? 0;

  return (
    <AccountSettingsClient
      email={user.email ?? ""}
      username={username}
      linkCap={linkCap}
      linksUsed={linksUsed}
      subscriptionStatus={profile.subscription_status}
      planTier={profile.plan_tier}
      planInterval={profile.plan_interval}
      currentPeriodEnd={profile.current_period_end}
      gracePeriodEndsAt={profile.grace_period_ends_at}
      stripeCustomerId={profile.stripe_customer_id}
    />
  );
}
