import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { planHasAnalytics } from "@/lib/config/pricing";
import { getActiveOwnerId } from "@/lib/team";
import { getUserPages } from "@/app/actions/analytics";
import { AnalyticsDashboard } from "./analytics-client";
import { AnalyticsUpgradeCTA } from "./analytics-upgrade-cta";
import type { SubscriptionStatus } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Analytics — Ultralink",
  robots: { index: false, follow: false },
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);
  const isEditor = activeOwnerId !== user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, grace_period_ends_at")
    .eq("id", activeOwnerId)
    .single();

  const subProfile = profile ?? {
    subscription_status: "none" as SubscriptionStatus,
    grace_period_ends_at: null,
  };

  if (!planHasAnalytics(subProfile)) {
    return <UpgradeGate isEditor={isEditor} />;
  }

  const pages = await getUserPages();

  return <AnalyticsDashboard pages={pages} />;
}

function UpgradeGate({ isEditor }: { isEditor: boolean }) {
  return (
    <div className="min-h-full flex items-center justify-center px-4" style={{ background: "#131313" }}>
      <div
        className="flex flex-col items-center text-center rounded-[20px] p-10 max-w-sm w-full"
        style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)" }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "#2A2A2A", border: "1px solid rgba(255,255,255,.08)" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: "#9A9A9A" }}
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2 className="text-lg font-bold mb-2" style={{ color: "#ffffff" }}>
          Analytics is a Pro feature.
        </h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "#9A9A9A" }}>
          {isEditor
            ? "The account owner needs to upgrade to Pro to enable analytics."
            : "See views, clicks, countries, devices, and your top-performing links. Pro starts at $8/mo."}
        </p>

        {!isEditor && <AnalyticsUpgradeCTA />}
      </div>
    </div>
  );
}
