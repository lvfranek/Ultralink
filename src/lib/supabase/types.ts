export type Plan = "free" | "creator" | "agency";

export interface Profile {
  id: string;
  plan: Plan;
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
  created_at: string;
}

export interface PageWithLinks extends Page {
  page_links: PageLink[];
}
