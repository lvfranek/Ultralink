import type { Page, PageLink, PageSocial } from "@/lib/supabase/types";
import type { Theme } from "@/lib/config/theme";
import {
  DEFAULT_THEME,
  resolveTheme,
  fontVar,
  cornerRadius,
  shadowValue,
  animClass,
  gradientEndColor,
} from "@/lib/config/theme";
import { SocialIcon } from "./social-icon";

interface ProfilePageViewProps {
  page: Pick<Page, "slug" | "title" | "bio" | "avatar_url" | "avatar_style" | "active_badge">;
  links: PageLink[];
  socials: PageSocial[];
  theme?: Theme | Record<string, unknown> | null;
  isPreview?: boolean;
}

export function ProfilePageView({ page, links, socials, theme: rawTheme, isPreview }: ProfilePageViewProps) {
  const theme: Theme = rawTheme && typeof rawTheme === 'object' && 'preset' in rawTheme
    ? (rawTheme as Theme)
    : resolveTheme(rawTheme as Record<string, unknown>);

  const t = theme ?? DEFAULT_THEME;

  const initial = (page.title || page.slug).charAt(0).toUpperCase();
  const isHero = page.avatar_style === "hero";

  // ── Compute page background CSS ──────────────────────────────────────────────
  const pageBgIsImage = t.pageBg.type === 'image' && t.pageBg.value;
  const pageBgStyle: React.CSSProperties = pageBgIsImage
    ? { position: 'relative' }
    : { background: t.pageBg.type === 'color' ? t.pageBg.value : t.pageBg.value };

  // ── Hero avatar fade colour ───────────────────────────────────────────────────
  // Fade the hero image into the actual page background.
  const heroFadeColor: string = (() => {
    if (t.pageBg.type === 'color') return t.pageBg.value;
    if (t.pageBg.type === 'gradient') return gradientEndColor(t.pageBg.value);
    return '#000000'; // image background — fade to black
  })();

  // ── Container background ──────────────────────────────────────────────────────
  const hasContainer = t.containerBg.type !== 'none' && t.containerBg.value;
  const containerBg = hasContainer ? t.containerBg.value : undefined;

  // ── Button styles ─────────────────────────────────────────────────────────────
  const btnBg = t.button.fill.value;
  const btnColor = t.button.textColor;
  const btnRadius = cornerRadius(t.button.corner);
  const btnShadow = shadowValue(t.button.shadow);
  const btnFont = fontVar(t.button.font);
  const btnAnimClass = animClass(t.animation);

  // ── Text styles ───────────────────────────────────────────────────────────────
  const titleColor = t.title.color;
  const titleFont = fontVar(t.title.font);
  const bodyColor = t.text.color;

  return (
    <div
      className={`min-h-full flex flex-col items-center ${isPreview ? "pb-6" : "min-h-dvh px-4 py-12 sm:py-16"}`}
      style={pageBgStyle}
    >
      {/* Image background layer + overlay */}
      {pageBgIsImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={t.pageBg.value}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          />
          {t.pageBg.overlay > 0 && (
            <div
              className="absolute inset-0"
              style={{ background: `rgba(0,0,0,${t.pageBg.overlay})`, zIndex: 1 }}
            />
          )}
        </>
      )}

      {/* All content above the image layers */}
      <div className={`w-full max-w-sm flex flex-col items-center ${pageBgIsImage ? 'relative z-10' : ''}`}>

        {/* Hero avatar */}
        {isHero && page.avatar_url && (
          <div className="relative w-full mb-6 overflow-hidden" style={{ height: 200 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.avatar_url}
              alt={page.title || page.slug}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to bottom, transparent 40%, ${heroFadeColor} 100%)` }}
            />
          </div>
        )}

        {/* Circle avatar */}
        {!isHero && (
          <div className={isPreview ? "mt-6 mb-5" : "mb-5"}>
            {page.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={page.avatar_url}
                alt={page.title || page.slug}
                className="w-24 h-24 rounded-full object-cover border-2 border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                style={{ background: "linear-gradient(135deg, #E6C878 0%, #C9A86A 100%)", color: '#0A0A0B' }}
                aria-hidden="true"
              >
                {initial}
              </div>
            )}
          </div>
        )}

        {/* Hero: placeholder if no avatar yet */}
        {isHero && !page.avatar_url && (
          <div
            className="w-full h-32 mb-6 flex items-center justify-center"
            style={{ background: `linear-gradient(to bottom, rgba(255,255,255,0.05), transparent)` }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: "linear-gradient(135deg, #E6C878 0%, #C9A86A 100%)", color: '#0A0A0B' }}
              aria-hidden="true"
            >
              {initial}
            </div>
          </div>
        )}

        {/* Active badge */}
        {page.active_badge && (
          <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Active now</span>
          </div>
        )}

        {/* Name */}
        {page.title && (
          <h1
            className={`font-bold text-center ${isPreview ? "text-lg mb-1" : "text-xl mb-2"}`}
            style={{ color: titleColor, fontFamily: titleFont }}
          >
            {page.title}
          </h1>
        )}

        {/* Slug handle */}
        <p
          className={`text-center ${isPreview ? "text-xs mb-3" : "text-sm mb-3"}`}
          style={{ color: bodyColor, opacity: 0.6 }}
        >
          @{page.slug}
        </p>

        {/* Bio */}
        {page.bio && (
          <p
            className={`text-center leading-relaxed max-w-xs ${isPreview ? "text-xs mb-5" : "text-sm mb-8"}`}
            style={{ color: bodyColor }}
          >
            {page.bio}
          </p>
        )}

        {/* Socials icon row */}
        {socials.length > 0 && (
          <div className={`flex flex-wrap items-center justify-center gap-3 ${isPreview ? "mb-5" : "mb-8"}`}>
            {socials.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: bodyColor, opacity: 0.7 }}
                className="hover:opacity-100 transition-opacity"
                aria-label={social.platform}
              >
                <SocialIcon platform={social.platform} size={isPreview ? 16 : 20} />
              </a>
            ))}
          </div>
        )}

        {/* Link stack — wrapped in optional container panel */}
        <div
          className={`w-full ${hasContainer ? (isPreview ? 'rounded-xl p-3' : 'rounded-2xl p-4') : ''} ${isPreview ? "space-y-2" : "space-y-3"}`}
          style={hasContainer ? { background: containerBg } : undefined}
        >
          {links.length > 0 ? (
            <nav
              className={`w-full ${isPreview ? "space-y-2" : "space-y-3"}`}
              aria-label={`${page.title || page.slug}'s links`}
            >
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative flex items-center gap-3 w-full ${isPreview ? "px-4 py-3 text-xs" : "px-5 py-4 text-sm"} font-medium transition-all duration-150 active:scale-[0.99] ${btnAnimClass}`}
                  style={{
                    background: btnBg,
                    color: btnColor,
                    borderRadius: btnRadius,
                    boxShadow: btnShadow,
                    fontFamily: btnFont,
                  }}
                >
                  {/* Link icon */}
                  {link.icon && !link.icon.startsWith("http") && (
                    <span className="flex-shrink-0 opacity-70" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={isPreview ? "w-3 h-3" : "w-4 h-4"}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                      </svg>
                    </span>
                  )}
                  {link.icon && link.icon.startsWith("http") && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={link.icon} alt="" className={`flex-shrink-0 object-contain rounded-sm ${isPreview ? "w-4 h-4" : "w-5 h-5"}`} />
                  )}

                  {/* Thumbnail */}
                  {link.thumbnail_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={link.thumbnail_url}
                      alt=""
                      className={`flex-shrink-0 rounded-sm object-cover ${isPreview ? "w-8 h-8" : "w-10 h-10"}`}
                    />
                  )}

                  <span className="flex-1 text-center">{link.label || link.url}</span>

                  {/* 18+ badge */}
                  {link.is_adult && (
                    <span
                      className="flex-shrink-0 text-[10px] font-bold border rounded px-1 py-0.5"
                      style={{ borderColor: `${btnColor}40`, color: btnColor, opacity: 0.7 }}
                    >
                      18+
                    </span>
                  )}
                </a>
              ))}
            </nav>
          ) : (
            !isPreview && (
              <p className="text-sm text-center mt-4" style={{ color: bodyColor, opacity: 0.5 }}>No links yet.</p>
            )
          )}
        </div>

        {/* Attribution */}
        {!isPreview && (
          <div className="mt-12 flex items-center gap-1.5">
            <a
              href="https://ultralink.bio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:opacity-80 transition-opacity"
              style={{ color: bodyColor, opacity: 0.5 }}
            >
              Powered by <span style={{ color: '#C9A86A', opacity: 1 }} className="font-medium">ultralink</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
