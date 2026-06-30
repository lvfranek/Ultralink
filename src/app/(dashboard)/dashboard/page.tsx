import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config/site";
import { getLinkCap } from "@/lib/config/pricing";
import { isProActive } from "@/lib/supabase/types";
import { getActiveOwnerId } from "@/lib/team";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { Page, SubscriptionStatus } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Ultralink Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ username?: string; upgraded?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);
  const isEditor = activeOwnerId !== user.id;

  const [pagesResult, profileResult] = await Promise.all([
    supabase.from("pages").select("*").eq("owner_id", activeOwnerId).order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("subscription_status, grace_period_ends_at, plan_tier, stripe_customer_id")
      .eq("id", activeOwnerId)
      .single(),
  ]);

  const profile = profileResult.data ?? {
    subscription_status: "none" as SubscriptionStatus,
    grace_period_ends_at: null,
    plan_tier: null,
    stripe_customer_id: null,
  };

  const linkCap = getLinkCap(profile);
  const sp = await searchParams;
  const initialSlug = sp.username ?? "";
  const upgraded = sp.upgraded === "1";

  const lapsed =
    !isEditor &&
    profile.subscription_status !== "none" &&
    !isProActive(profile);

  let survivingPageId: string | null = null;
  if (lapsed) {
    const pages = (pagesResult.data ?? []) as Page[];
    if (pages.length > 0) {
      const oldest = [...pages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )[0];
      survivingPageId = oldest.id;
    }
  }

  return (
    <DashboardShell
      pages={(pagesResult.data ?? []) as Page[]}
      siteUrl={siteConfig.url}
      initialSlug={initialSlug}
      linkCap={linkCap}
      upgraded={upgraded}
      subscriptionStatus={isEditor ? "active" : (profile.subscription_status as SubscriptionStatus)}
      gracePeriodEndsAt={isEditor ? null : profile.grace_period_ends_at}
      stripeCustomerId={isEditor ? null : profile.stripe_customer_id}
      survivingPageId={survivingPageId}
      lapsed={lapsed}
    />
  );
}
