import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getLinkCap } from "@/lib/config/pricing";
import { getActiveOwnerId } from "@/lib/team";
import type { SubscriptionStatus, PlanInterval, TeamMember, TeamInvite } from "@/lib/supabase/types";
import { AccountSettingsClient } from "./account-settings-client";

export const metadata: Metadata = {
  title: "Account settings — Ultralink",
  robots: { index: false, follow: false },
};

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);
  const isEditor = activeOwnerId !== user.id;

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

  // Fetch team data only when user is looking at their own account
  let teamMembers: (TeamMember & { editor_username: string; editor_display_name: string | null })[] = [];
  let pendingInvites: TeamInvite[] = [];

  if (!isEditor) {
    const [membersResult, invitesResult] = await Promise.all([
      supabase
        .from("team_members")
        .select("id, owner_id, editor_id, created_at")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("team_invites")
        .select("*")
        .eq("owner_id", user.id)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false }),
    ]);

    const rawMembers = membersResult.data ?? [];
    if (rawMembers.length > 0) {
      const editorIds = rawMembers.map((m: { editor_id: string }) => m.editor_id);
      const { data: editorProfiles } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", editorIds);

      const profileMap = new Map(
        (editorProfiles ?? []).map((ep: { id: string; username: string; display_name: string | null }) => [ep.id, ep])
      );

      teamMembers = rawMembers.map((m: TeamMember) => ({
        ...m,
        editor_username: profileMap.get(m.editor_id)?.username ?? m.editor_id,
        editor_display_name: profileMap.get(m.editor_id)?.display_name ?? null,
      }));
    }

    pendingInvites = (invitesResult.data ?? []) as TeamInvite[];
  }

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
      isEditor={isEditor}
      teamMembers={teamMembers}
      pendingInvites={pendingInvites}
    />
  );
}
