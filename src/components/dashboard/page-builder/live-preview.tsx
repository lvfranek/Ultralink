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
    /* Dark canvas that frames the phone */
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: "#0D0D0D" }}
      aria-label="Page preview"
    >
      {/* Phone frame — matches iPhone 14 proportions */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: 390,
          height: "88%",
          maxHeight: 844,
          borderRadius: 44,
          border: "2px solid rgba(255,255,255,0.14)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.04)",
          overflow: "hidden",
        }}
      >
        {/* Scrollable content — no scrollbar chrome */}
        <div
          className="absolute inset-0 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <ProfilePageView
            page={page}
            links={links.filter((l) => l.is_active)}
            socials={socials}
            theme={theme}
            isPreview
          />
        </div>
      </div>
    </div>
  );
}
