"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useActionState } from "react";
import { updatePage } from "@/app/actions/pages";
import { sanitizeSlug, validateSlug } from "@/lib/slug";
import { checkSlugAvailable } from "@/app/actions/pages";
import { applyPresetToLinks } from "@/app/actions/links";
import { ProfileTab } from "./profile-tab";
import { PresetsContent, TypographyContent, ColorsContent } from "./design-tab";
import { LinksTab } from "./links-tab";
import { LivePreview } from "./live-preview";
import { SettingsCard } from "./panel-primitives";
import type { Page, PageLink, PageSocial, Plan } from "@/lib/supabase/types";
import { type Theme, type LinkStyle, type PresetKey, resolveTheme, PRESET_META, FONT_OPTIONS } from "@/lib/config/theme";

interface PageBuilderProps {
  page: Page;
  initialLinks: PageLink[];
  initialSocials: PageSocial[];
  plan: Plan;
  userId: string;
  siteUrl: string;
}

type LocalPageState = Pick<
  Page,
  "title" | "bio" | "avatar_url" | "avatar_style" | "active_badge" | "slug"
>;

export function PageBuilder({ page, initialLinks, initialSocials, plan, userId, siteUrl }: PageBuilderProps) {
  const [links, setLinks] = useState<PageLink[]>(initialLinks);
  const [socials, setSocials] = useState<PageSocial[]>(initialSocials);
  const [activeTab, setActiveTab] = useState<"page" | "links">("page");

  const [local, setLocal] = useState<LocalPageState>({
    title: page.title,
    bio: page.bio,
    avatar_url: page.avatar_url,
    avatar_style: page.avatar_style ?? "circle",
    active_badge: page.active_badge ?? false,
    slug: page.slug,
  });

  const [theme, setTheme] = useState<Theme>(() => resolveTheme(page.theme as Record<string, unknown>));

  const [isDirty, setIsDirty] = useState(false);
  const [hasLinksDirty, setHasLinksDirty] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugOk, setSlugOk] = useState(true);
  const [checking, setChecking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const canUseBadge = plan === "creator" || plan === "agency";

  const boundUpdatePage = updatePage.bind(null, page.id);
  const [state, formAction, pending] = useActionState(boundUpdatePage, null);

  useEffect(() => {
    if (state && "ok" in state) {
      setSaveSuccess(true);
      setIsDirty(false);
      const t = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  useEffect(() => {
    if (local.slug === page.slug) {
      setSlugOk(true);
      setSlugError(null);
      return;
    }
    setSlugOk(false);
    setSlugError(null);
    if (!local.slug) return;

    const clientError = validateSlug(local.slug);
    if (clientError) { setSlugError(clientError); return; }

    setChecking(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const result = await checkSlugAvailable(local.slug, page.id);
      setChecking(false);
      if (result.available) { setSlugOk(true); setSlugError(null); }
      else setSlugError(result.error ?? "Not available.");
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [local.slug, page.slug, page.id]);

  const handleLocalChange = useCallback((patch: Partial<LocalPageState>) => {
    setLocal((prev) => ({ ...prev, ...patch }));
    setIsDirty(true);
  }, []);

  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    setIsDirty(true);
  }, []);

  const handlePresetApply = useCallback(async (key: PresetKey, linkStyle: LinkStyle) => {
    setLinks((prev) =>
      prev.map((l) => ({
        ...l,
        fill_type: linkStyle.fillType,
        fill_value: linkStyle.fillValue,
        text_color: linkStyle.textColor,
        corner: linkStyle.corner,
        animation: linkStyle.animation,
      }))
    );
    await applyPresetToLinks(page.id, {
      fill_type: linkStyle.fillType,
      fill_value: linkStyle.fillValue,
      text_color: linkStyle.textColor,
      corner: linkStyle.corner,
      animation: linkStyle.animation,
    });
  }, [page.id]);

  const canSave = !slugError && slugOk && (local.title?.trim().length ?? 0) > 0;
  const publicUrl = `${siteUrl}/${local.slug || page.slug}`;

  const previewPage = {
    slug: local.slug || page.slug,
    title: local.title ?? "",
    bio: local.bio,
    avatar_url: local.avatar_url,
    avatar_style: local.avatar_style ?? "circle",
    active_badge: local.active_badge ?? false,
  } as const;

  const activeLinks = links.filter((l) => l.is_active).sort((a, b) => a.position - b.position);

  // Summaries for collapsed cards
  const presetLabel = theme.preset === "custom" ? "Custom" : (PRESET_META[theme.preset]?.label ?? theme.preset);
  const themeSummary = `${presetLabel} · ${theme.pageBg.type}`;
  const titleLabel = FONT_OPTIONS.find((f) => f.id === theme.fonts.title)?.label ?? theme.fonts.title;
  const bodyLabel  = FONT_OPTIONS.find((f) => f.id === theme.fonts.body)?.label ?? theme.fonts.body;
  const typographySummary = `${titleLabel} / ${bodyLabel}`;
  const visibilitySummary = local.active_badge ? "Active" : "Off";

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#131313" }}>

      {/* Canvas: floating rounded container holding preview + right panel */}
      <div className="flex-1 flex overflow-hidden p-3.5">
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ background: "#212121", borderRadius: 18, border: "1px solid rgba(255,255,255,.08)" }}
        >

          {/* Error banner */}
          {((state && "error" in state) || slugError) && (
            <div className="flex-shrink-0 px-4 py-2 border-b border-red-800/30 bg-red-950/10">
              <p className="text-xs text-red-400">
                {(state && "error" in state && state.error) || slugError}
              </p>
            </div>
          )}

          {/* Sticky sub-header: spans full canvas width */}
          <div
            className="flex-shrink-0 px-4 py-2.5 flex items-center gap-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}
          >
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs transition-colors truncate min-w-0"
                style={{ color: "#9A9A9A" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#9A9A9A"; }}
              >
                {siteUrl.replace(/^https?:\/\//, "")}/{local.slug || page.slug}
              </a>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(publicUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
                className="flex-shrink-0 p-0.5 rounded transition-colors cursor-pointer"
                style={{ color: copied ? "#34d399" : "#9A9A9A" }}
                onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = "#9A9A9A"; }}
                aria-label="Copy URL"
              >
                {copied ? (
                  <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M2 7l3.5 3.5L12 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="5" y="5" width="8" height="8" rx="1" />
                    <path d="M9 5V2a1 1 0 00-1-1H2a1 1 0 00-1 1v6a1 1 0 001 1h3" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            </div>

            {(isDirty || hasLinksDirty) && (
              <span className={`text-xs flex-shrink-0 ${hasLinksDirty ? "text-red-400 font-medium" : "text-text-subtle"}`}>
                Unsaved
              </span>
            )}

            <form action={formAction} className="flex-shrink-0">
              <input type="hidden" name="slug" value={local.slug} />
              <input type="hidden" name="title" value={local.title ?? ""} />
              <input type="hidden" name="bio" value={local.bio ?? ""} />
              <input type="hidden" name="is_active" value="true" />
              <input type="hidden" name="avatar_url" value={local.avatar_url ?? ""} />
              <input type="hidden" name="avatar_style" value={local.avatar_style ?? "circle"} />
              <input type="hidden" name="active_badge" value={String(local.active_badge ?? false)} />
              <input type="hidden" name="theme" value={JSON.stringify(theme)} />
              <button
                type="submit"
                disabled={!canSave || pending}
                className="px-4 py-1.5 text-xs font-semibold rounded-full transition-colors disabled:opacity-40 cursor-pointer"
                style={{ background: "#ffffff", color: "#000000" }}
              >
                {pending ? "Saving…" : saveSuccess ? "Saved!" : "Save"}
              </button>
            </form>
          </div>

          {/* Body: middle preview + right settings panel */}
          <div className="flex-1 flex overflow-hidden">

            {/* Middle: live preview — fills the full panel */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden">
              <LivePreview page={previewPage} links={activeLinks} socials={socials} theme={theme} />
            </div>

            {/* Right: settings panel */}
            <div
              className="w-full lg:w-96 flex flex-col overflow-hidden flex-shrink-0"
              style={{ borderLeft: "1px solid rgba(255,255,255,.05)" }}
            >

              {/* Tab switcher — centered pill segmented control */}
              <div className="flex-shrink-0 py-3 flex justify-center">
                <div
                  className="inline-flex p-1"
                  style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)", borderRadius: 999 }}
                >
                  {(["page", "links"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className="px-5 py-1.5 text-xs font-semibold capitalize transition-all duration-150 cursor-pointer"
                      style={{
                        borderRadius: 999,
                        background: activeTab === tab ? "#ffffff" : "transparent",
                        color: activeTab === tab ? "#000000" : "#9A9A9A",
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable settings */}
              <div className="flex-1 overflow-y-auto">

                {/* PAGE tab */}
                {activeTab === "page" && (
                  <div className="px-3 pt-1 pb-8 space-y-2.5">

                {/* 1. Identity — open by default */}
                <SettingsCard title="Identity" defaultOpen>
                  {/* URL slug */}
                  <div className="mb-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-subtle select-none pointer-events-none">
                        {siteUrl.replace(/^https?:\/\//, "")}/
                      </span>
                      <input
                        type="text"
                        value={local.slug}
                        onChange={(e) => handleLocalChange({ slug: sanitizeSlug(e.target.value) })}
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        className={[
                          "w-full bg-surface-2 border text-text rounded-[var(--radius)] pl-[8rem] pr-9 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2",
                          slugError
                            ? "border-red-400 focus:ring-red-400/30"
                            : slugOk
                            ? "border-emerald-400 focus:ring-emerald-400/20"
                            : "border-border-strong focus:ring-text/20",
                        ].join(" ")}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {checking && (
                          <span className="inline-block w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin text-text-subtle" />
                        )}
                        {!checking && slugOk && (
                          <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 7l3.5 3.5L12 3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </div>
                    {slugError && <p className="mt-1 text-xs text-red-400">{slugError}</p>}
                  </div>

                  <ProfileTab
                    page={local}
                    userId={userId}
                    onChange={(patch) => handleLocalChange(patch as Partial<LocalPageState>)}
                  />
                </SettingsCard>

                {/* 2. Theme */}
                <SettingsCard title="Theme" summary={themeSummary}>
                  <PresetsContent
                    theme={theme}
                    userId={userId}
                    onChange={handleThemeChange}
                    onPresetApply={handlePresetApply}
                  />
                </SettingsCard>

                {/* 3. Typography */}
                <SettingsCard title="Typography" summary={typographySummary}>
                  <TypographyContent theme={theme} onChange={handleThemeChange} />
                </SettingsCard>

                {/* 4. Colors */}
                <SettingsCard title="Colors" summary="3 set">
                  <ColorsContent theme={theme} onChange={handleThemeChange} />
                </SettingsCard>

                {/* 5. Visibility */}
                <SettingsCard title="Visibility" summary={visibilitySummary}>
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-text flex items-center gap-2">
                        Active now badge
                        {!canUseBadge && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-gold-dim text-gold border border-gold/20 rounded font-semibold uppercase tracking-wider">
                            Creator+
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Shows a green "Active now" indicator on your page
                      </p>
                    </div>
                    {canUseBadge ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={local.active_badge ?? false}
                        onClick={() => handleLocalChange({ active_badge: !local.active_badge })}
                        className={[
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer flex-shrink-0 ml-3",
                          local.active_badge ? "bg-emerald-500" : "bg-surface-2 border border-border-strong",
                        ].join(" ")}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${local.active_badge ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </button>
                    ) : (
                      <a
                        href="/#pricing"
                        className="text-xs text-gold hover:text-gold-bright transition-colors flex-shrink-0 ml-3"
                      >
                        Upgrade →
                      </a>
                    )}
                  </div>
                </SettingsCard>

                {/* 6. Advanced — Phase-5 stubs */}
                <SettingsCard title="Advanced" summary="3 coming soon">
                  <div className="space-y-1">
                    {[
                      { label: "Custom Domain", description: "Point your own domain (e.g. links.yourbrand.com) to this page." },
                      { label: "Geo-Blocking",  description: "Restrict access to specific countries or regions." },
                      { label: "Win-Back",       description: "Show a prompt to visitors who start to leave, offering a second destination." },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between py-2.5 opacity-50"
                        style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
                      >
                        <span className="text-sm text-text">{item.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-surface-2 text-text-subtle border border-border-strong rounded font-semibold uppercase tracking-wider">
                          Phase 5
                        </span>
                      </div>
                    ))}
                  </div>
                </SettingsCard>

              </div>
            )}

            {/* LINKS tab */}
            {activeTab === "links" && (
              <div className="px-3 pt-3 pb-8">
                <LinksTab
                  pageId={page.id}
                  userId={userId}
                  links={links}
                  onLinksChange={setLinks}
                  socials={socials}
                  onSocialsChange={setSocials}
                  onDirtyChange={setHasLinksDirty}
                />
              </div>
            )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
