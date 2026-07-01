"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { sanitizeSlug, validateSlug } from "@/lib/slug";
import { checkSlugAvailable, duplicatePage } from "@/app/actions/pages";

interface DuplicateLinkModalProps {
  sourcePageId: string;
  sourceSlug: string;
  onClose: () => void;
  onDuplicated: (newPageId: string) => void;
}

export function DuplicateLinkModal({ sourcePageId, sourceSlug, onClose, onDuplicated }: DuplicateLinkModalProps) {
  const [slug, setSlug] = useState(() => sanitizeSlug(`${sourceSlug}-copy`));
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugOk, setSlugOk] = useState(false);
  const [checking, setChecking] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDuplicating, startDuplicating] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    setSlugOk(false);
    setSlugError(null);
    if (!slug) return;

    const clientError = validateSlug(slug);
    if (clientError) { setSlugError(clientError); return; }

    setChecking(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const result = await checkSlugAvailable(slug);
      setChecking(false);
      if (result.available) { setSlugOk(true); setSlugError(null); }
      else setSlugError(result.error ?? "Not available.");
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [slug]);

  function handleConfirm() {
    setSubmitError(null);
    startDuplicating(async () => {
      const result = await duplicatePage(sourcePageId, slug);
      if ("error" in result) {
        setSubmitError(result.error);
      } else if ("pageId" in result && result.pageId) {
        onDuplicated(result.pageId);
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl p-6"
          style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.12)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "#ffffff" }}>
              Duplicate link page
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg transition-colors cursor-pointer"
              style={{ color: "#9A9A9A" }}
              aria-label="Close"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <label className="block text-xs font-medium mb-1.5" style={{ color: "#9A9A9A" }}>
            Slug
          </label>
          <div className="relative">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(sanitizeSlug(e.target.value))}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className="w-full bg-surface-2 border text-text rounded-[var(--radius)] px-3 pr-9 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
              style={{
                borderColor: slugError ? "#f87171" : slugOk ? "#34d399" : "rgba(255,255,255,.18)",
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {checking && (
                <span className="inline-block w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" style={{ color: "#9A9A9A" }} />
              )}
              {!checking && slugOk && (
                <svg viewBox="0 0 14 14" className="w-3.5 h-3.5" style={{ color: "#34d399" }} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 7l3.5 3.5L12 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </div>
          {slugError && <p className="mt-1.5 text-xs" style={{ color: "#f87171" }}>{slugError}</p>}
          {submitError && <p className="mt-1.5 text-xs" style={{ color: "#f87171" }}>{submitError}</p>}

          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-medium border rounded-full transition-colors cursor-pointer"
              style={{ color: "#9A9A9A", borderColor: "rgba(255,255,255,.12)" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!slugOk || isDuplicating}
              className="flex-1 py-2 text-xs font-semibold rounded-full transition-all disabled:opacity-40 cursor-pointer"
              style={{ background: "#ffffff", color: "#000000" }}
            >
              {isDuplicating ? "Duplicating…" : "Duplicate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
