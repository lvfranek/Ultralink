// The editor works on a plain "draft" of the page. These helpers turn the stored
// page into a draft, the draft into what the live preview renders, and say what's
// missing before it can be saved.

import {
  DEFAULT_LINK_STYLE,
  PRESETS,
  gradientEndColor,
  resolveTheme,
  type PresetKey,
  type Theme,
} from "@/lib/config/theme";
import type { Page, PageLink, PageSocial, WinBack } from "@/lib/supabase/types";

export type Corner = "square" | "rounded" | "more" | "pill";
export type Animation = "none" | "bounce" | "shake" | "pulse";

export interface EdLink {
  id: string;
  /** Not stored yet; gets a real id when saved */
  isNew?: boolean;
  kind: "button" | "heading";
  label: string;
  url: string;
  active: boolean;
  /** Visitors confirm they're 18+ before the link opens */
  adult: boolean;
  animation: Animation;
  icon: string | null;
}

export interface EdSocial {
  id: string;
  isNew?: boolean;
  platform: string;
  url: string;
}

export interface Colors {
  background: string;
  button: string;
  buttonText: string;
  name: string;
  text: string;
  icons: string;
}

export interface Draft {
  name: string;
  bio: string;
  avatarUrl: string | null;
  avatarStyle: "circle" | "hero";
  links: EdLink[];
  socials: EdSocial[];
  /** "custom" once any colour has been changed by hand */
  preset: PresetKey | "custom";
  colors: Colors;
  corner: Corner;
  font: string;
  badge: boolean;
  /** Visitors confirm they're 18+ before they see the page at all */
  ageGate: boolean;
  blockedCountries: string[];
  winBack: { enabled: boolean; headline: string; url: string; ageGate: boolean };
}

export const BIO_MAX = 160;

// ─── Colours ─────────────────────────────────────────────────────────────────

/** #abc / #AABBCC / gradients → #aabbcc, which the native colour picker needs */
export function toHex(value: string | undefined, fallback: string): string {
  let v = (value ?? "").trim();
  if (v.includes("gradient")) v = gradientEndColor(v);
  const short = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (short) v = `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
  return /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : fallback;
}

export function presetColors(key: PresetKey): Colors {
  const { theme, linkStyle } = PRESETS[key];
  return {
    background: toHex(theme.pageBg.value, "#ffffff"),
    button: toHex(linkStyle.fillValue, "#06aeef"),
    buttonText: toHex(linkStyle.textColor, "#ffffff"),
    name: toHex(theme.colors.name, "#0a0a0a"),
    text: toHex(theme.colors.handle, "#5a5a5a"),
    icons: toHex(theme.colors.icons, "#0a0a0a"),
  };
}

// ─── Stored page → draft ─────────────────────────────────────────────────────

export function draftFromPage(page: Page, links: PageLink[], socials: PageSocial[]): Draft {
  const theme = resolveTheme(page.theme as Record<string, unknown>);
  const presetKey = theme.preset !== "custom" && theme.preset in PRESETS ? (theme.preset as PresetKey) : null;
  const fallback = presetColors(presetKey ?? "glacier");

  // One style for every button: the first button's, as agreed for existing pages
  const first = links.find((l) => l.item_type === "button");
  const bg = theme.pageBg;
  const wb = (page.win_back ?? { enabled: false, headline: "", url: "" }) as WinBack & { age_gate?: boolean };

  return {
    name: page.title ?? "",
    bio: page.bio ?? "",
    avatarUrl: page.avatar_url,
    avatarStyle: page.avatar_style === "hero" ? "hero" : "circle",
    links: links.map((l) => ({
      id: l.id,
      kind: l.item_type === "heading" ? "heading" : "button",
      label: l.label ?? "",
      url: l.url ?? "",
      active: l.is_active,
      adult: l.is_adult,
      animation: (["none", "bounce", "shake", "pulse"].includes(l.animation) ? l.animation : "none") as Animation,
      icon: l.icon && l.icon.startsWith("http") ? l.icon : null,
    })),
    socials: socials.map((x) => ({ id: x.id, platform: x.platform, url: x.url })),
    preset: presetKey ?? "custom",
    colors: {
      // A gradient keeps its end colour; an image falls back to the preset's background
      background: bg.type === "image" ? fallback.background : toHex(bg.value, fallback.background),
      button: toHex(first?.fill_value, fallback.button),
      buttonText: toHex(first?.text_color, fallback.buttonText),
      name: toHex(theme.colors.name, fallback.name),
      text: toHex(theme.colors.handle, fallback.text),
      icons: toHex(theme.colors.icons, fallback.icons),
    },
    corner: ((first?.corner as Corner) ?? DEFAULT_LINK_STYLE.corner) as Corner,
    font: theme.fonts.title,
    badge: page.active_badge ?? false,
    ageGate: page.age_gate_enabled ?? false,
    blockedCountries: Array.isArray(page.blocked_countries) ? page.blocked_countries : [],
    winBack: { enabled: !!wb.enabled, headline: wb.headline ?? "", url: wb.url ?? "", ageGate: !!wb.age_gate },
  };
}

// ─── Draft → stored shapes ───────────────────────────────────────────────────

export function themeFromDraft(d: Draft): Theme {
  return {
    preset: d.preset,
    pageBg: { type: "color", value: d.colors.background, overlay: 0 },
    fonts: { title: d.font, body: d.font },
    colors: { name: d.colors.name, handle: d.colors.text, icons: d.colors.icons },
  };
}

/** The shared button style, as stored on every button row */
export function buttonStyle(d: Draft) {
  return { fill_type: "color", fill_value: d.colors.button, text_color: d.colors.buttonText, corner: d.corner };
}

/** What the real public page component needs to render the preview */
export function previewData(d: Draft, slug: string, pageId: string, pro: boolean) {
  const style = buttonStyle(d);
  const now = new Date(0).toISOString();
  return {
    page: {
      slug,
      title: d.name,
      bio: d.bio,
      avatar_url: d.avatarUrl,
      avatar_style: d.avatarStyle,
      active_badge: pro && d.badge,
    },
    links: d.links
      .filter((l) => l.active)
      .map((l, i): PageLink => ({
        id: l.id,
        page_id: pageId,
        label: l.label || (l.kind === "heading" ? "Untitled heading" : "Untitled button"),
        url: l.url,
        position: i,
        layout: "classic",
        is_active: true,
        icon: l.icon,
        is_adult: l.adult,
        ...style,
        text_color: l.kind === "heading" ? "" : style.text_color,
        animation: l.animation,
        item_type: l.kind,
        created_at: now,
      })),
    socials: d.socials
      .filter((x) => !urlError(x.url))
      .map((x, i): PageSocial => ({
        id: x.id,
        page_id: pageId,
        platform: x.platform,
        url: x.url,
        position: i,
        created_at: now,
      })),
    theme: themeFromDraft(d),
  };
}

// ─── Validation ──────────────────────────────────────────────────────────────

/** Adds https:// when someone types "youtube.com/@me" */
export function normalizeUrl(raw: string) {
  const v = raw.trim();
  if (!v || /^[a-z][a-z0-9+.-]*:\/\//i.test(v) || v.startsWith("mailto:")) return v;
  return `https://${v}`;
}

export function urlError(raw: string, { allowMailto = false } = {}): string | null {
  const v = raw.trim();
  if (!v || v === "https://") return "Add the address this opens.";
  if (allowMailto && /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(v)) return null;
  try {
    const u = new URL(normalizeUrl(v));
    if (u.protocol !== "https:" && u.protocol !== "http:") return "Links must start with https://";
    if (!u.hostname.includes(".") || /\s/.test(v)) return "That doesn't look like a web address.";
    return null;
  } catch {
    return "That doesn't look like a web address.";
  }
}

/** What a URL field shows after blur: the completed address, or what was typed if it isn't valid yet */
export const tidyUrl = (raw: string) => (urlError(raw) ? raw : normalizeUrl(raw));

export function hostOf(url: string) {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Everything that blocks saving, most important first */
export function draftProblems(d: Draft): string[] {
  const buttons = d.links.filter((l) => l.kind === "button");
  const unlabeled = buttons.filter((l) => !l.label.trim()).length;
  const badUrls = buttons.filter((l) => urlError(l.url)).length;
  const badSocials = d.socials.filter((x) => urlError(x.url, { allowMailto: x.platform === "email" })).length;
  return [
    !d.name.trim() && "Add a name",
    unlabeled && `Label ${unlabeled} ${unlabeled === 1 ? "button" : "buttons"}`,
    badUrls && `Fix ${badUrls} ${badUrls === 1 ? "button" : "buttons"}`,
    badSocials && `Fix ${badSocials} social ${badSocials === 1 ? "link" : "links"}`,
    d.winBack.enabled && !d.winBack.headline.trim() && "Add a Win-Back headline",
    d.winBack.enabled && urlError(d.winBack.url) && "Fix your Win-Back link",
  ].filter(Boolean) as string[];
}
