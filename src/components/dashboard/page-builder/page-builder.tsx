"use client";

import { useState, useCallback, useTransition, useEffect, useRef } from "react";
import { useActionState } from "react";
import { updatePage } from "@/app/actions/pages";
import { sanitizeSlug, validateSlug } from "@/lib/slug";
import { checkSlugAvailable } from "@/app/actions/pages";
import { ProfileTab } from "./profile-tab";
import { DesignTab } from "./design-tab";
import { LinksTab } from "./links-tab";
import { SocialsTab } from "./socials-tab";
import { AdvancedTab } from "./advanced-tab";
import { LivePreview } from "./live-preview";
import type { Page, PageLink, PageSocial, Plan } from "@/lib/supabase/types";
import { type Theme, resolveTheme } from "@/lib/config/theme";

type Tab = "profile" | "design" | "links" | "socials" | "advanced";

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
  | "title" | "bio" | "avatar_url" | "avatar_style" | "active_badge"
  | "slug" | "is_active" | "age_gate_enabled"
>;

export function PageBuilder({ page, initialLinks, initialSocials, plan, userId, siteUrl }: PageBuilderProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [showPreview, setShowPreview] = useState(false);

  const [links, setLinks] = useState<PageLink[]>(initialLinks);
  const [socials, setSocials] = useState<PageSocial[]>(initialSocials);

  const [local, setLocal] = useState<LocalPageState>({
    title: page.title,
    bio: page.bio,
    avatar_url: page.avatar_url,
    avatar_style: page.avatar_style ?? "circle",
    active_badge: page.active_badge ?? false,
    slug: page.slug,
    is_active: page.is_active,
    age_gate_enabled: page.age_gate_enabled,
  });

  const [theme, setTheme] = useState<Theme>(() => resolveTheme(page.theme as Record<string, unknown>));

  const [isDirty, setIsDirty] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugOk, setSlugOk] = useState(true);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isPending, startTransition] = useTransition();

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

  // Slug availability check
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

  const canSave = !slugError && slugOk && (local.title?.trim().length ?? 0) > 0;

  const publicUrl = `${siteUrl}/${local.slug || page.slug}`;

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "profile",  label: "Profile" },
    { id: "design",   label: "Design" },
    { id: "links",    label: "Links" },
    { id: "socials",  label: "Socials" },
    { id: "advanced", label: "Advanced" },
  ];

  const previewPage = {
    slug: local.slug || page.slug,
    title: local.title ?? "",
    bio: local.bio,
    avatar_url: local.avatar_url,
    avatar_style: local.avatar_style ?? "circle",
    active_badge: local.active_badge ?? false,
  } as const;

  const activeLinks = links.filter((l) => l.is_active).sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col h-full">
      {/* Compact header */}
      <div className="flex-shrink-0 border-b border-border bg-white px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* URL + copy */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-muted hover:text-text transition-colors truncate max-w-xs"
            >
              {siteUrl}/{local.slug || page.slug}
            </a>
            <button
              type="button"
              onClick={copyUrl}
              className="flex-shrink-0 p-1.5 text-text-subtle hover:text-text transition-colors cursor-pointer"
              aria-label="Copy link"
            >
              {copied ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-400">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                  <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Active/inactive toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-subtle">{local.is_active ? "Live" : "Hidden"}</span>
              <button
                type="button"
                role="switch"
                aria-checked={local.is_active}
                onClick={() => handleLocalChange({ is_active: !local.is_active })}
                className={[
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer",
                  local.is_active ? "bg-emerald-500" : "bg-surface-2 border border-border-strong",
                ].join(" ")}
              >
                <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform shadow-sm ${local.is_active ? "translate-x-5" : "translate-x-1"}`} />
              </button>
            </div>

            {/* Unsaved indicator */}
            {isDirty && (
              <span className="text-xs text-text-subtle">Unsaved</span>
            )}

            {/* Save */}
            <form action={formAction}>
              <input type="hidden" name="slug" value={local.slug} />
              <input type="hidden" name="title" value={local.title ?? ""} />
              <input type="hidden" name="bio" value={local.bio ?? ""} />
              <input type="hidden" name="is_active" value={String(local.is_active)} />
              <input type="hidden" name="avatar_url" value={local.avatar_url ?? ""} />
              <input type="hidden" name="avatar_style" value={local.avatar_style ?? "circle"} />
              <input type="hidden" name="active_badge" value={String(local.active_badge ?? false)} />
              <input type="hidden" name="age_gate_enabled" value={String(local.age_gate_enabled)} />
              <input type="hidden" name="theme" value={JSON.stringify(theme)} />
              <button
                type="submit"
                disabled={!canSave || pending}
                className="px-4 py-1.5 text-xs font-semibold bg-gold text-bg rounded-[var(--radius-sm)] hover:bg-gold-bright transition-colors disabled:opacity-40 cursor-pointer shadow-[0_1px_4px_rgba(0,0,0,0.10)]"
              >
                {pending ? "Saving…" : saveSuccess ? "Saved!" : "Save"}
              </button>
            </form>
          </div>
        </div>

        {/* Error from save */}
        {state && "error" in state && (
          <p className="mt-2 text-xs text-red-400">{state.error}</p>
        )}
        {slugError && (
          <p className="mt-2 text-xs text-red-400">{slugError}</p>
        )}
      </div>

      {/* Main body: two-pane on desktop, stacked on mobile */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left pane: tabs */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Tab bar */}
          <div className="flex-shrink-0 border-b border-border px-4 sm:px-6 overflow-x-auto">
            <div className="flex gap-1 -mb-px min-w-max">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap",
                    activeTab === tab.id
                      ? "border-text text-text"
                      : "border-transparent text-text-muted hover:text-text hover:border-border-strong",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}

              {/* Preview toggle on mobile */}
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="ml-auto lg:hidden px-3 py-3 text-sm text-text-muted hover:text-text cursor-pointer"
                aria-label="Toggle preview"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                  <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile preview drawer */}
          {showPreview && (
            <div className="lg:hidden border-b border-border p-6 flex justify-center bg-surface-2">
              <LivePreview page={previewPage} links={activeLinks} socials={socials} theme={theme} />
            </div>
          )}

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            {/* Slug editor shown in profile tab */}
            {activeTab === "profile" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-muted mb-1.5">Username (URL)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-subtle select-none pointer-events-none">
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
                      "w-full bg-surface-2 border text-text rounded-[var(--radius)] pl-[8.5rem] pr-10 py-3 text-sm transition-colors focus:outline-none focus:ring-2",
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
            )}

            {activeTab === "profile" && (
              <ProfileTab
                page={local}
                plan={plan}
                userId={userId}
                onChange={(patch) => handleLocalChange(patch as Partial<LocalPageState>)}
              />
            )}
            {activeTab === "design" && (
              <DesignTab
                theme={theme}
                userId={userId}
                onChange={handleThemeChange}
              />
            )}
            {activeTab === "links" && (
              <LinksTab
                pageId={page.id}
                userId={userId}
                links={links}
                onLinksChange={setLinks}
              />
            )}
            {activeTab === "socials" && (
              <SocialsTab
                pageId={page.id}
                socials={socials}
                onSocialsChange={setSocials}
              />
            )}
            {activeTab === "advanced" && (
              <AdvancedTab
                page={local}
                onChange={(patch) => handleLocalChange(patch as Partial<LocalPageState>)}
              />
            )}
          </div>
        </div>

        {/* Right pane: live preview (desktop only) */}
        <div className="hidden lg:flex flex-col items-center justify-start gap-6 w-80 flex-shrink-0 border-l border-border bg-surface-2 p-8 overflow-y-auto">
          <LivePreview page={previewPage} links={activeLinks} socials={socials} theme={theme} />
        </div>
      </div>
    </div>
  );
}
