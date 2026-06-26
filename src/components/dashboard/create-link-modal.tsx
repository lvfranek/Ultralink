"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { createPage, checkSlugAvailable } from "@/app/actions/pages";
import { sanitizeSlug, validateSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateLinkModalProps {
  onClose: () => void;
  initialSlug?: string;
}

export function CreateLinkModal({ onClose, initialSlug = "" }: CreateLinkModalProps) {
  const router = useRouter();
  const [slug, setSlug] = useState(sanitizeSlug(initialSlug));
  const [title, setTitle] = useState("");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugOk, setSlugOk] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [state, formAction, isPending] = useActionState(createPage, null);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state && "pageId" in state) {
      router.push(`/dashboard/links/${state.pageId}`);
    }
  }, [state, router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
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
      else { setSlugError(result.error ?? "Not available."); setSlugOk(false); }
    }, 400);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [slug]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(sanitizeSlug(e.target.value));
    setShowValidation(false);
  };

  const isFormValid = !slugError && slugOk && title.trim().length > 0;

  const handleSubmitAttempt = () => {
    if (!isFormValid) setShowValidation(true);
  };

  const missingMessage = () => {
    if (!slug) return "Enter a username for your link page.";
    if (slugError) return slugError;
    if (!slugOk && !slugError && slug) return "Wait for username availability check.";
    if (!title.trim()) return "Enter a page title.";
    return null;
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-md bg-surface-2 border border-border rounded-[var(--radius-lg)] shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
            <h2 id="create-modal-title" className="text-lg font-semibold text-text">
              New link page
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[var(--radius-sm)] text-text-subtle hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form action={formAction} className="px-6 py-5 space-y-5">
            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-xs font-medium text-text-muted mb-1.5">
                Username <span className="text-text-subtle font-normal">(your link URL)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-subtle select-none pointer-events-none">
                  ultralink.bio/
                </span>
                <input
                  ref={inputRef}
                  id="slug"
                  name="slug"
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="yourname"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={isPending}
                  className={[
                    "w-full bg-surface-2 border text-text placeholder-text-subtle rounded-[var(--radius)] pl-[7.5rem] pr-10 py-3 text-sm transition-colors duration-150 focus:outline-none focus:ring-2 disabled:opacity-50",
                    slugError
                      ? "border-red-400 focus:ring-red-400/30 focus:border-red-400"
                      : slugOk
                      ? "border-emerald-400 focus:ring-emerald-400/20 focus:border-emerald-400"
                      : "border-border-strong focus:ring-text/20 focus:border-text/30",
                  ].join(" ")}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" aria-hidden="true">
                  {checking && (
                    <span className="inline-block w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin text-text-subtle" />
                  )}
                  {!checking && slugOk && (
                    <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 7l3.5 3.5L12 3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {!checking && slugError && (
                    <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l8 8M11 3L3 11" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
              </div>
              {slugError && <p className="mt-1.5 text-xs text-red-500">{slugError}</p>}
              {slugOk && !slugError && <p className="mt-1.5 text-xs text-emerald-600">Available!</p>}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-xs font-medium text-text-muted mb-1.5">
                Page title
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setShowValidation(false); }}
                placeholder="e.g. John's links"
                disabled={isPending}
              />
            </div>

            {/* Inline hint */}
            {showValidation && missingMessage() && (
              <div role="alert" className="p-3 rounded-[var(--radius-sm)] bg-surface-2 border border-border-strong text-sm text-text-muted">
                {missingMessage()}
              </div>
            )}

            {/* Server error */}
            {state && "error" in state && (
              <div role="alert" className="p-3 rounded-[var(--radius-sm)] bg-red-950/30 border border-red-800/40 text-sm text-red-400">
                {state.error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 py-3 text-sm font-medium text-text-muted border border-border-strong rounded-[var(--radius)] hover:bg-surface-2 hover:text-text transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              {isFormValid ? (
                <Button
                  type="submit"
                  variant="gold"
                  size="md"
                  loading={isPending}
                  className="flex-1"
                >
                  {isPending ? "Creating…" : "Create link"}
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitAttempt}
                  className="flex-1 py-3 text-sm font-medium text-text-subtle bg-surface border border-border rounded-[var(--radius)] cursor-pointer hover:bg-surface-2 transition-colors"
                >
                  Create link
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
