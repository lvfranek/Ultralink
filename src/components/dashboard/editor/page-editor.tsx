"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Eye, Loader2 } from "lucide-react";
import { ProfilePageView } from "@/components/public/profile-page-view";
import { useSlugField } from "@/components/app/slug-dialog";
import { useToast } from "@/components/app/toast";
import { cx, Dialog, Segmented } from "@/components/app/ui";
import { useNavigationLoading } from "@/components/dashboard/navigation-loading";
import { draftProblems, previewData, type Draft, type EdLink } from "./draft";
import { LinksCard, ProfileCard, SocialsCard } from "./content";
import { saveDraft } from "./save";
import { DesignCard, SettingsCard } from "./style";
import s from "@/components/app/app.module.css";

export type EditorTab = "content" | "design" | "settings";

export interface PageEditorProps {
  pageId: string;
  slug: string;
  initial: Draft;
  siteUrl: string;
  userId: string;
  pro: boolean;
  /** Clicks per button in the last 30 days, Pro only */
  clicks: Record<string, number> | null;
  tab: EditorTab;
  onTab: (t: EditorTab) => void;
}

export function PageEditor({ pageId, slug, initial, siteUrl, userId, pro, clicks, tab, onTab }: PageEditorProps) {
  const router = useRouter();
  const toast = useToast();
  const { startLoading } = useNavigationLoading();

  const [draft, setDraft] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  // Where the user was heading when we stopped them to ask about unsaved work
  const [leaving, setLeaving] = useState<{ href: string } | { back: true } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const slugField = useSlugField(slug, { currentSlug: slug, excludePageId: pageId });
  // Set once leaving (or saving) is confirmed, so the unsaved-work guards stand down
  const allowLeave = useRef(false);
  const host = siteUrl.replace(/^https?:\/\//, "");

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initial) || slugField.slug !== slug,
    [draft, initial, slugField.slug, slug],
  );
  const problems = [
    ...draftProblems(draft),
    ...(slugField.status === "invalid" || slugField.status === "unavailable" ? ["Fix your link"] : []),
  ];
  const canSave = dirty && problems.length === 0 && !saving && slugField.status === "available";
  const dirtyRef = useRef(dirty);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const editLinks = (fn: (links: EdLink[]) => EdLink[]) => setDraft((d) => ({ ...d, links: fn(d.links) }));

  // Removes the parked Back entry (see below) before the page reloads, so a later
  // Back press can't land on an entry holding the pre-save version of the page.
  const dropBackGuard = () =>
    new Promise<void>((resolve) => {
      if (!history.state?.editorGuard) return resolve();
      allowLeave.current = true;
      window.addEventListener("popstate", () => resolve(), { once: true });
      history.back();
    });

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    const slugChanged = slugField.slug !== slug;
    const result = await saveDraft(pageId, slugField.slug, initial, draft);
    if ("error" in result && !result.written) {
      // Nothing was stored (e.g. the link is taken): keep everything to fix and retry
      setSaving(false);
      setSaveError(result.error);
      return;
    }
    await dropBackGuard();
    toast(
      "error" in result
        ? `${result.error} The editor now shows what was saved.`
        : slugChanged
          ? `Saved. Your link is now ${host}/${slugField.slug}`
          : "Changes saved",
    );
    // Reloads the stored page; the editor remounts on it with nothing unsaved
    router.refresh();
  };

  // ⌘S / Ctrl+S saves, like everywhere else
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ─── Leaving with unsaved work ─────────────────────────────────────────────
  // One rule for every way out: links anywhere on screen, the browser's Back
  // button and closing the tab all ask first.
  useEffect(() => {
    dirtyRef.current = dirty;
  });

  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirty]);

  // In-app links (sidebar, logo, upgrade…), caught before Next.js navigates
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!dirtyRef.current || allowLeave.current || e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      e.preventDefault();
      e.stopPropagation();
      setLeaving({ href: url.pathname + url.search + url.hash });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Browser Back: park an extra history entry while there's unsaved work, so the
  // first Back press lands on it and can become a question instead.
  useEffect(() => {
    if (!dirty) return;
    history.pushState({ ...history.state, editorGuard: true }, "", location.href);
    const onPop = () => {
      if (allowLeave.current) return;
      history.pushState({ ...history.state, editorGuard: true }, "", location.href);
      setLeaving({ back: true });
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      // Saved or discarded: take the parked entry away again
      if (!allowLeave.current && history.state?.editorGuard) history.back();
    };
  }, [dirty]);

  const leave = () => {
    if (!leaving) return;
    allowLeave.current = true;
    startLoading();
    // Back skips the parked entry and the editor itself
    if ("back" in leaving) history.go(-2);
    else router.push(leaving.href);
  };

  const back = () => {
    if (dirty) return setLeaving({ href: "/dashboard" });
    startLoading();
    router.push("/dashboard");
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const pv = previewData(draft, slugField.slug || slug, pageId, pro);
  const firstButton = pv.links.find((l) => l.item_type === "button") ?? null;

  const status = saving ? (
    <>
      <Loader2 size={14} className={s.spin} aria-hidden="true" /> Saving…
    </>
  ) : saveError ? (
    <span className={s.err}>{saveError}</span>
  ) : dirty ? (
    problems.length ? (
      <span className={s.err}>{problems[0]}</span>
    ) : (
      <>
        <span className={s.unsavedDot} aria-hidden="true" /> Unsaved changes
      </>
    )
  ) : (
    <>
      <Check size={14} strokeWidth={2.5} aria-hidden="true" /> All changes saved
    </>
  );

  const preview = (
    <div className={s.pvWrap}>
      <div className={s.pvBar}>
        <span className={s.liveDot} aria-hidden="true" />
        Live preview
      </div>
      <div className={s.pvPhone}>
        <div className={s.pvIsland} aria-hidden="true" />
        <div className={s.pvScreenReal}>
          <ProfilePageView
            page={pv.page}
            links={pv.links}
            socials={pv.socials}
            theme={pv.theme}
            isPreview
            isPro={pro}
            highlightLinkId={highlight}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={s.editor}>
      <header className={s.edHead}>
        <div className={cx(s.edInner, s.edHeadRow)}>
          <button type="button" className={s.iconBtn} onClick={back} aria-label="Back to your pages">
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          <div className={s.edTitle}>
            <h1>{initial.name || slug}</h1>
            <span className={s.edUrl}>
              {host}/{slug}
              <button
                type="button"
                className={cx(s.iconBtn, s.iconBtnBare)}
                style={{ width: 22, height: 22, color: copied ? "var(--green)" : undefined }}
                aria-label="Copy link"
                onClick={() => {
                  void navigator.clipboard?.writeText(`${siteUrl}/${slug}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? (
                  <Check size={12} strokeWidth={3} aria-hidden="true" />
                ) : (
                  <Copy size={12} aria-hidden="true" />
                )}
              </button>
            </span>
          </div>
          <span className={s.edStatus} role="status" aria-live="polite">
            {status}
          </span>
          {dirty && !saving && (
            <button
              type="button"
              className={cx(s.btnGhost, s.btnSm, s.desktopOnly)}
              onClick={() => {
                setDraft(initial);
                slugField.change(slug);
                setSaveError(null);
              }}
            >
              Discard
            </button>
          )}
          <button
            type="button"
            className={cx(s.btnLight, s.btnSm)}
            disabled={!canSave}
            onClick={() => void save()}
            title="Save (⌘S)"
          >
            Save
          </button>
        </div>
      </header>

      <div className={cx(s.edInner, s.edBody)}>
        <div className={s.edPanel}>
          <div className={s.edTabs}>
            <Segmented
              label="Editor section"
              value={tab}
              onChange={onTab}
              options={[
                { value: "content", label: "Content" },
                { value: "design", label: "Design" },
                { value: "settings", label: "Settings" },
              ]}
            />
          </div>

          {tab === "content" && (
            <div className={s.edStack} key="content">
              <ProfileCard draft={draft} set={set} slugField={slugField} userId={userId} />
              <LinksCard
                links={draft.links}
                edit={editLinks}
                clicks={clicks}
                userId={userId}
                onHighlight={setHighlight}
              />
              <SocialsCard socials={draft.socials} onChange={(socials) => set({ socials })} />
            </div>
          )}
          {tab === "design" && (
            <div className={s.edStack} key="design">
              <DesignCard draft={draft} set={set} />
            </div>
          )}
          {tab === "settings" && (
            <div className={s.edStack} key="settings">
              <SettingsCard draft={draft} set={set} pro={pro} preview={{ theme: pv.theme, firstLink: firstButton }} />
            </div>
          )}
        </div>

        <aside className={s.edPreview} aria-label="Live preview">
          {preview}
        </aside>
      </div>

      <button type="button" className={cx(s.previewFab, s.mobileOnly)} onClick={() => setPreviewOpen(true)}>
        <Eye size={16} aria-hidden="true" /> Preview
      </button>
      {previewOpen && (
        <Dialog title="Preview" onClose={() => setPreviewOpen(false)} className={s.previewDialog}>
          {preview}
        </Dialog>
      )}

      {leaving && (
        <Dialog
          title="Leave without saving?"
          description="Your changes to this page will be lost."
          onClose={() => setLeaving(null)}
        >
          <div className={s.dialogActions}>
            <button type="button" className={s.btnGhost} onClick={() => setLeaving(null)}>
              Keep editing
            </button>
            <button type="button" className={s.btnDanger} onClick={leave}>
              Discard changes
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
