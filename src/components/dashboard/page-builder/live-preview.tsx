"use client";

import type { Page, PageLink, PageSocial } from "@/lib/supabase/types";
import type { Theme } from "@/lib/config/theme";
import { ProfilePageView } from "@/components/public/profile-page-view";

interface LivePreviewProps {
  page: Pick<Page, "slug" | "title" | "bio" | "avatar_url" | "avatar_style" | "active_badge">;
  links: PageLink[];
  socials: PageSocial[];
  theme: Theme;
}

export function LivePreview({ page, links, socials, theme }: LivePreviewProps) {
  return (
    <div className="absolute inset-0 overflow-y-auto" style={{ scrollbarWidth: "none" }} aria-label="Page preview">
      <ProfilePageView
        page={page}
        links={links.filter((l) => l.is_active)}
        socials={socials}
        theme={theme}
        isPreview
      />
    </div>
  );
}
