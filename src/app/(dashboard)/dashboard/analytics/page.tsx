import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { planHasAnalytics } from "@/lib/config/pricing";
import { getActiveOwnerId } from "@/lib/team";
import { getUserPages } from "@/app/actions/analytics";
import { AnalyticsDashboard } from "./analytics-client";
import { EXAMPLE_ANALYTICS_DATA } from "@/lib/analytics/example-data";
import type { SubscriptionStatus } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Ultralink Analytics",
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, grace_period_ends_at")
    .eq("id", activeOwnerId)
    .single();

  const subProfile = profile ?? {
    subscription_status: "none" as SubscriptionStatus,
    grace_period_ends_at: null,
  };

  const pages = await getUserPages();

  if (!planHasAnalytics(subProfile)) {
    return <AnalyticsDashboard pages={pages} exampleData={EXAMPLE_ANALYTICS_DATA} />;
  }

  return <AnalyticsDashboard pages={pages} />;
}
