"use client";

import { useState, useCallback, useEffect } from "react";
import type { Page, PageLink, PageSocial } from "@/lib/supabase/types";
import type { Theme } from "@/lib/config/theme";
import {
  DEFAULT_THEME,
  resolveTheme,
  resolveLinkStyle,
  fontVar,
  cornerRadius,
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

// ─── 18+ interstitial ─────────────────────────────────────────────────────────

const SESSION_KEY = "ultralink_adult_confirmed";

function useAdultGate() {
  const check = useCallback((linkId: string, url: string, e: React.MouseEvent) => {
    if (typeof window === "undefined") return;
    const confirmed = sessionStorage.getItem(SESSION_KEY) === "1";
    if (confirmed) return;
    e.preventDefault();
    showGate(url);
  }, []);

  return check;
}

// We use a module-level singleton modal rather than React state to avoid
// re-rendering the entire page tree when the interstitial opens.
let _resolveGate: ((proceed: boolean) => void) | null = null;

function showGate(destination: string) {
  const existing = document.getElementById("__ul_gate");
  if (existing) return;

  const overlay = document.createElement("div");
  overlay.id = "__ul_gate";
  Object.assign(overlay.style, {
    position: "fixed", inset: "0", zIndex: "9999",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "rgba(0,0,0,0.85)", padding: "1rem",
  });

  const box = document.createElement("div");
  Object.assign(box.style, {
    background: "#18181b", border: "1px solid #3f3f46",
    borderRadius: "1rem", padding: "2rem", maxWidth: "340px",
    width: "100%", textAlign: "center",
  });

  const badge = document.createElement("div");
  badge.textContent = "18+";
  Object.assign(badge.style, {
    display: "inline-block", fontSize: "1.5rem", fontWeight: "700",
    color: "#e4e4e7", marginBottom: "1rem",
  });

  const msg = document.createElement("p");
  msg.textContent = "This link may contain adult content. Are you 18 or older?";
  Object.assign(msg.style, {
    color: "#a1a1aa", fontSize: "0.875rem", lineHeight: "1.5", marginBottom: "1.5rem",
  });

  const btnYes = document.createElement("button");
  btnYes.textContent = "Yes, continue";
  Object.assign(btnYes.style, {
    display: "block", width: "100%", padding: "0.75rem",
    background: "#C9A86A", color: "#0A0A0B", fontWeight: "600",
    fontSize: "0.875rem", borderRadius: "0.5rem", border: "none",
    cursor: "pointer", marginBottom: "0.5rem",
  });

  const btnNo = document.createElement("button");
  btnNo.textContent = "No, go back";
  Object.assign(btnNo.style, {
    display: "block", width: "100%", padding: "0.75rem",
    background: "transparent", color: "#71717a", fontWeight: "500",
    fontSize: "0.875rem", borderRadius: "0.5rem",
    border: "1px solid #3f3f46", cursor: "pointer",
  });

  btnYes.addEventListener("click", () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    document.body.removeChild(overlay);
    window.open(destination, "_blank", "noopener,noreferrer");
  });

  btnNo.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  box.appendChild(badge);
  box.appendChild(msg);
  box.appendChild(btnYes);
  box.appendChild(btnNo);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function ProfilePageView({ page, links, socials, theme: rawTheme, isPreview }: ProfilePageViewProps) {
  const theme: Theme = rawTheme && typeof rawTheme === 'object' && 'preset' in rawTheme
    ? (rawTheme as Theme)
    : resolveTheme(rawTheme as Record<string, unknown>);

  const t = theme ?? DEFAULT_THEME;

  const initial = (page.title || page.slug).charAt(0).toUpperCase();
  const isHero = page.avatar_style === "hero";

  // ── Page background ───────────────────────────────────────────────────────────
  const pageBgIsImage = t.pageBg.type === 'image' && t.pageBg.value;
  const pageBgStyle: React.CSSProperties = pageBgIsImage
    ? { position: 'relative' }
    : { background: t.pageBg.value };

  // ── Hero fade colour ──────────────────────────────────────────────────────────
  const heroFadeColor: string = (() => {
    if (t.pageBg.type === 'color') return t.pageBg.value;
    if (t.pageBg.type === 'gradient') return gradientEndColor(t.pageBg.value);
    return '#000000';
  })();

  // Set html/body background to page theme so macOS scroll-bounce matches
  useEffect(() => {
    if (isPreview) return;
    const bg = pageBgIsImage ? "#000000" : (t.pageBg.value || "#000000");
    const prev = document.documentElement.style.background;
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
    return () => {
      document.documentElement.style.background = prev;
      document.body.style.background = "";
    };
  }, [isPreview, pageBgIsImage, t.pageBg.value]);

  // ── Typography ────────────────────────────────────────────────────────────────
  const titleFont = fontVar(t.fonts.title);
  const bodyFont  = fontVar(t.fonts.body);
  const nameColor   = t.colors.name;
  const handleColor = t.colors.handle;
  const iconsColor  = t.colors.icons;

  return (
    <div
      className={`min-h-full flex flex-col items-center ${isPreview ? "px-4 pt-10 pb-8" : "min-h-dvh px-4 py-12 sm:py-16"}`}
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
          {(t.pageBg.overlay ?? 0) > 0 && (
            <div
              className="absolute inset-0"
              style={{ background: `rgba(0,0,0,${t.pageBg.overlay})`, zIndex: 1 }}
            />
          )}
        </>
      )}

      {/* All content above the image layers */}
      <div className={`w-full max-w-sm flex flex-col items-center ${pageBgIsImage ? 'relative z-10' : ''}`}>

        {/* Hero avatar — only when photo is uploaded */}
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

        {/* Circle avatar — when not hero OR when hero but no photo yet (fallback) */}
        {(!isHero || !page.avatar_url) && (
          <div className="mb-5">
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
                style={{ background: "#ffffff", color: "#0A0A0B" }}
                aria-hidden="true"
              >
                {initial}
              </div>
            )}
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
            style={{ color: nameColor, fontFamily: titleFont }}
          >
            {page.title}
          </h1>
        )}

        {/* Slug handle */}
        <p
          className={`text-center ${isPreview ? "text-xs mb-3" : "text-sm mb-3"}`}
          style={{ color: handleColor }}
        >
          @{page.slug}
        </p>

        {/* Bio */}
        {page.bio && (
          <p
            className={`text-center leading-relaxed max-w-xs ${isPreview ? "text-xs mb-5" : "text-sm mb-8"}`}
            style={{ color: handleColor, fontFamily: bodyFont }}
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
                style={{ color: iconsColor }}
                className="hover:opacity-80 transition-opacity"
                aria-label={social.platform}
              >
                <SocialIcon platform={social.platform} size={isPreview ? 16 : 20} />
              </a>
            ))}
          </div>
        )}

        {/* Link stack */}
        <div className={`w-full ${isPreview ? "space-y-2" : "space-y-3"}`}>
          {links.length > 0 ? (
            <nav
              className={`w-full px-4 ${isPreview ? "space-y-2" : "space-y-3"}`}
              aria-label={`${page.title || page.slug}'s links`}
            >
              {links.map((link) => (
                <LinkButton
                  key={link.id}
                  link={link}
                  isPreview={isPreview ?? false}
                />
              ))}
            </nav>
          ) : (
            !isPreview && (
              <p className="text-sm text-center mt-4" style={{ color: handleColor, opacity: 0.5 }}>No links yet.</p>
            )
          )}
        </div>

        {/* Attribution + footer */}
        {!isPreview && (
          <div className="mt-12 flex flex-col items-center gap-4 pb-8">
            <a
              href="https://ultralink.bio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:opacity-70 transition-opacity"
              style={{ color: handleColor, opacity: 0.45 }}
            >
              Powered by <span className="font-medium">ultralink</span>
            </a>
            <div className="flex items-center gap-4" style={{ opacity: 0.3 }}>
              <a href="/privacy" className="text-xs hover:opacity-70 transition-opacity" style={{ color: handleColor }}>Privacy</a>
              <span className="text-xs" style={{ color: handleColor }}>·</span>
              <a href="/terms" className="text-xs hover:opacity-70 transition-opacity" style={{ color: handleColor }}>Terms</a>
              <span className="text-xs" style={{ color: handleColor }}>·</span>
              <a
                href={`mailto:report@ultralink.bio?subject=Report: ${encodeURIComponent(page.slug)}`}
                className="text-xs hover:opacity-70 transition-opacity"
                style={{ color: handleColor }}
              >
                Report
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Individual link button ───────────────────────────────────────────────────

function LinkButton({ link, isPreview }: { link: PageLink; isPreview: boolean }) {
  const ls = resolveLinkStyle(link);
  const btnRadius = cornerRadius(ls.corner);
  const animCls = animClass(ls.animation);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!link.is_adult || isPreview) return;
    if (typeof window === "undefined") return;
    const confirmed = sessionStorage.getItem(SESSION_KEY) === "1";
    if (confirmed) return;
    e.preventDefault();
    showGate(link.url);
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={[
        "relative flex items-center gap-3 w-full font-medium transition-all duration-150 active:scale-[0.99]",
        isPreview ? "px-4 py-3 text-xs" : "px-5 py-4 text-sm",
        animCls,
      ].filter(Boolean).join(" ")}
      style={{
        background: ls.fillValue,
        color: ls.textColor,
        borderRadius: btnRadius,
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

      {/* 18+ badge — visible to creator in preview */}
      {link.is_adult && (
        <span
          className="flex-shrink-0 text-[10px] font-bold border rounded px-1 py-0.5"
          style={{ borderColor: `${ls.textColor}40`, color: ls.textColor, opacity: 0.8 }}
        >
          18+
        </span>
      )}
    </a>
  );
}
