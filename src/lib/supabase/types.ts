export type Plan = "free" | "creator" | "agency";
export type AvatarStyle = "circle" | "hero";

export interface Profile {
  id: string;
  plan: Plan;
  username: string;
  display_name: string | null;
  created_at: string;
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
  thumbnail_url: string | null;
  is_adult: boolean;
  // per-link style columns (added in migration)
  fill_type: string;
  fill_value: string;
  text_color: string;
  corner: string;
  animation: string;
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
