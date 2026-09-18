"use client";

import type { Page, PageLink, PageSocial } from "@/lib/supabase/types";
import type { Theme } from "@/lib/config/theme";
import { ProfilePageView } from "@/components/public/profile-page-view";

interface LivePreviewProps {
  page: Pick<Page, "slug" | "title" | "bio" | "avatar_url" | "avatar_style" | "active_badge">;
  links: PageLink[];
  socials: PageSocial[];
  theme: Theme;
  isPro?: boolean;
}

export function LivePreview({ page, links, socials, theme, isPro }: LivePreviewProps) {
  const pageBgIsImage = theme.pageBg.type === "image" && !!theme.pageBg.value;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden" aria-label="Page preview">
      {/* Canvas background — mirrors the desktop public page backdrop */}
      <div className="absolute inset-0" aria-hidden>
        {page.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded image (Supabase Storage URL), shown as-is rather than through Next's image optimizer
          <img
            src={page.avatar_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "blur(60px) saturate(1.1) brightness(0.65)",
              transform: "scale(1.15)",
            }}
          />
        ) : pageBgIsImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded image (Supabase Storage URL), shown as-is rather than through Next's image optimizer
          <img
            src={theme.pageBg.value}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              filter: "blur(60px) saturate(1.1) brightness(0.65)",
              transform: "scale(1.15)",
            }}
          />
        ) : (
          <div className="absolute inset-0" style={{ background: theme.pageBg.value || "#0D0D0D" }} />
        )}
      </div>

      {/* Content frame — full-bleed on mobile, phone-frame mockup on desktop */}
      <div
        className="relative flex flex-col w-full h-full md:w-[390px] md:h-[88%] md:max-h-[844px] md:rounded-[44px] md:shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
        style={{
          overflow: "hidden",
        }}
      >
        {/* Scrollable content — no scrollbar chrome */}
        <div className="absolute inset-0 overflow-y-auto no-scrollbar" style={{ scrollbarWidth: "none" }}>
          <ProfilePageView
            page={page}
            links={links.filter((l) => l.is_active)}
            socials={socials}
            theme={theme}
            isPreview
            isPro={isPro}
          />
        </div>
      </div>
    </div>
  );
}
