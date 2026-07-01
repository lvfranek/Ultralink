"use client";

import type { Page, PageLink, PageSocial, WinBack } from "@/lib/supabase/types";
import type { Theme } from "@/lib/config/theme";
import { ProfilePageView } from "@/components/public/profile-page-view";

interface LivePreviewProps {
  page: Pick<Page, "slug" | "title" | "bio" | "avatar_url" | "avatar_style" | "active_badge">;
  links: PageLink[];
  socials: PageSocial[];
  theme: Theme;
  winBack?: WinBack;
  isPro?: boolean;
}

export function LivePreview({ page, links, socials, theme, winBack, isPro }: LivePreviewProps) {
  const pageBgIsImage = theme.pageBg.type === "image" && !!theme.pageBg.value;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      aria-label="Page preview"
    >
      {/* Canvas background — mirrors the desktop public page backdrop */}
      <div className="absolute inset-0" aria-hidden>
        {page.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
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
          // eslint-disable-next-line @next/next/no-img-element
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
          <div
            className="absolute inset-0"
            style={{ background: theme.pageBg.value || "#0D0D0D" }}
          />
        )}
      </div>

      {/* Content frame — no border, just rounded clip + shadow for depth */}
      <div
        className="relative flex flex-col"
        style={{
          width: 390,
          height: "88%",
          maxHeight: 844,
          borderRadius: 44,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
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
            isPro={isPro}
          />
        </div>

        {/* Win-Back static chip — visible when enabled so creator can preview the copy */}
        {winBack?.enabled && (winBack.headline || winBack.url) && (
          <div className="absolute bottom-4 left-3 right-3 z-10 pointer-events-none">
            <div
              className="rounded-xl px-3 py-2"
              style={{
                background: "rgba(0,0,0,0.78)",
                border: "1px solid rgba(255,255,255,.14)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p
                className="text-[9px] uppercase tracking-widest mb-1"
                style={{ color: "#9A9A9A" }}
              >
                Win-Back preview
              </p>
              {winBack.headline && (
                <p
                  className="text-xs font-medium leading-snug"
                  style={{ color: "#ffffff" }}
                >
                  {winBack.headline}
                </p>
              )}
              {winBack.url && (() => {
                try {
                  return (
                    <p className="text-[10px] mt-0.5" style={{ color: "#9A9A9A" }}>
                      {new URL(winBack.url).hostname}
                    </p>
                  );
                } catch {
                  return null;
                }
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
