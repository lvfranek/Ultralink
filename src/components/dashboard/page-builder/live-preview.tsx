"use client";

import type { Page, PageLink, PageSocial } from "@/lib/supabase/types";
import { ProfilePageView } from "@/components/public/profile-page-view";

interface LivePreviewProps {
  page: Pick<Page, "slug" | "title" | "bio" | "avatar_url" | "avatar_style" | "active_badge">;
  links: PageLink[];
  socials: PageSocial[];
}

export function LivePreview({ page, links, socials }: LivePreviewProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs font-medium text-text-subtle uppercase tracking-widest">Preview</p>

      {/* Phone frame */}
      <div
        className="relative bg-bg border-2 border-border-strong rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]"
        style={{ width: 280, height: 560 }}
        aria-label="Page preview"
      >
        {/* Status bar mock */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-bg z-10 flex items-center justify-between px-5 pt-1">
          <span className="text-[10px] font-semibold text-text-subtle">9:41</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-20 h-4 bg-surface rounded-full border border-border" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-subtle">●●●</span>
          </div>
        </div>

        {/* Scrollable page content */}
        <div className="absolute inset-0 top-8 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <ProfilePageView
            page={page}
            links={links.filter((l) => l.is_active)}
            socials={socials}
            isPreview
          />
        </div>
      </div>
    </div>
  );
}
