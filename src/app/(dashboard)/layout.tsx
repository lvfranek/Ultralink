import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardChrome } from "@/components/dashboard/dashboard-chrome";
import { getActiveOwnerId, getTeamMemberships } from "@/lib/team";
import { getLinkCap } from "@/lib/config/pricing";
import type { SubscriptionStatus } from "@/lib/supabase/types";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileResult, memberships] = await Promise.all([
    supabase.from("profiles").select("display_name, username, has_seen_welcome").eq("id", user.id).single(),
    getTeamMemberships(user.id, supabase),
  ]);

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);

  const [{ data: activeOwnerProfile }, { count: pagesUsed }] = await Promise.all([
    supabase
      .from("profiles")
      .select("subscription_status, plan_tier, grace_period_ends_at")
      .eq("id", activeOwnerId)
      .single(),
    supabase.from("pages").select("*", { count: "exact", head: true }).eq("owner_id", activeOwnerId),
  ]);

  return (
    <>
      <style>{`html, body { background: #08080a !important; }`}</style>
      {/* dark-theme keeps the not-yet-redesigned screens inside readable */}
      <div className="dark-theme">
        <DashboardChrome
          user={user}
          displayName={profileResult.data?.display_name}
          username={profileResult.data?.username}
          activeOwnerId={activeOwnerId}
          teamMemberships={memberships}
          hasSeenWelcome={profileResult.data?.has_seen_welcome ?? false}
          activeOwnerSubscriptionStatus={(activeOwnerProfile?.subscription_status as SubscriptionStatus) ?? "none"}
          pagesUsed={pagesUsed ?? 0}
          linkCap={
            activeOwnerProfile
              ? getLinkCap({
                  subscription_status: activeOwnerProfile.subscription_status as SubscriptionStatus,
                  plan_tier: activeOwnerProfile.plan_tier,
                  grace_period_ends_at: activeOwnerProfile.grace_period_ends_at,
                })
              : 1
          }
        >
          {children}
        </DashboardChrome>
      </div>
    </>
  );
}
