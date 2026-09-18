"use client";

import type { SubscriptionStatus, PlanInterval, TeamInvite } from "@/lib/supabase/types";
import { DangerZoneCard } from "./danger-zone-card";
import { PlanCard } from "./plan-card";
import { PreferencesCard } from "./preferences-card";
import { ProfileCard } from "./profile-card";
import { EmailCard, PasswordCard } from "./security-cards";
import { EnrichedMember, TeamCard } from "./team-card";

interface AccountSettingsClientProps {
  email: string;
  username: string;
  linkCap: number;
  linksUsed: number;
  subscriptionStatus: SubscriptionStatus;
  planTier: number | null;
  planInterval: PlanInterval | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt: string | null;
  stripeCustomerId: string | null;
  isEditor: boolean;
  teamMembers: EnrichedMember[];
  pendingInvites: TeamInvite[];
}

export function AccountSettingsClient({
  email,
  username,
  linkCap,
  linksUsed,
  subscriptionStatus,
  planTier,
  planInterval,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  gracePeriodEndsAt,
  stripeCustomerId,
  isEditor,
  teamMembers,
  pendingInvites,
}: AccountSettingsClientProps) {
  return (
    <div style={{ minHeight: "100%", background: "#131313" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#ffffff", margin: "0 0 4px" }}>Account settings</h1>
          <p style={{ fontSize: 14, color: "#6B6B6B", margin: 0 }}>Manage your account, security, and preferences.</p>
        </div>

        <PlanCard
          subscriptionStatus={subscriptionStatus}
          planTier={planTier}
          planInterval={planInterval}
          currentPeriodEnd={currentPeriodEnd}
          cancelAtPeriodEnd={cancelAtPeriodEnd}
          gracePeriodEndsAt={gracePeriodEndsAt}
          stripeCustomerId={stripeCustomerId}
          linksUsed={linksUsed}
          linkCap={linkCap}
          isEditor={isEditor}
        />
        <PreferencesCard />

        {!isEditor && (
          <TeamCard
            subscriptionStatus={subscriptionStatus}
            gracePeriodEndsAt={gracePeriodEndsAt}
            teamMembers={teamMembers}
            pendingInvites={pendingInvites}
            ownerUsername={username}
          />
        )}

        <ProfileCard initialUsername={username} />
        <EmailCard email={email} />
        <PasswordCard />
        <DangerZoneCard username={username} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
