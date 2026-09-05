export type SubscriptionStatus = "none" | "active" | "trialing" | "past_due" | "canceled" | "grace";
export type PlanInterval = "monthly" | "annual";
export type AvatarStyle = "circle" | "hero";

export type WinBack = {
  enabled: boolean;
  headline: string;
  url: string;
  age_gate?: boolean;
};

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  created_at: string;
  // Subscription (Phase 4)
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_tier: number | null;
  plan_interval: PlanInterval | null;
  subscription_status: SubscriptionStatus;
  grace_period_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  has_seen_welcome: boolean;
}

export function getEffectivePlan(profile: Pick<Profile, "subscription_status">): "free" | "pro" {
  const s = profile.subscription_status;
  if (s === "active" || s === "trialing" || s === "grace") return "pro";
  return "free";
}

export function isProActive(profile: Pick<Profile, "subscription_status" | "grace_period_ends_at">): boolean {
  if (profile.subscription_status === "active" || profile.subscription_status === "trialing") return true;
  if (
    profile.subscription_status === "grace" &&
    profile.grace_period_ends_at &&
    new Date(profile.grace_period_ends_at) > new Date()
  ) return true;
  return false;
}

export interface Page {
  id: string;
  owner_id: string;
  slug: string;
  title: string;
  bio: string | null;
  avatar_url: string | null;
  avatar_style: AvatarStyle;
  active_badge: boolean;
  template: string;
  theme: Record<string, unknown>;
  age_gate_enabled: boolean;
  blocked_countries: string[];
  win_back: WinBack;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageLink {
  id: string;
  page_id: string;
  label: string;
  url: string;
  position: number;
  layout: string;
  is_active: boolean;
  icon: string | null;
  is_adult: boolean;
  fill_type: string;
  fill_value: string;
  text_color: string;
  corner: string;
  animation: string;
  item_type: "button" | "heading";
  created_at: string;
}

export interface PageSocial {
  id: string;
  page_id: string;
  platform: string;
  url: string;
  position: number;
  created_at: string;
}

export interface PageWithLinks extends Page {
  page_links: PageLink[];
}

export interface PageWithData extends Page {
  page_links: PageLink[];
  page_socials: PageSocial[];
}

export type DeviceType = "mobile" | "tablet" | "desktop" | "bot" | "unknown";
export type EventKind = "view" | "click" | "winback_shown" | "winback_click";

export interface Event {
  id: number;
  page_id: string;
  link_id: string | null;
  kind: EventKind;
  country: string | null;
  device: DeviceType;
  referrer_host: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  owner_id: string;
  editor_id: string;
  created_at: string;
}

export interface TeamInvite {
  id: string;
  owner_id: string;
  email: string;
  token: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}
