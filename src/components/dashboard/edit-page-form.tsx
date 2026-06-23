"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { updatePage, deletePage, checkSlugAvailable } from "@/app/actions/pages";
import { sanitizeSlug, validateSlug } from "@/lib/slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Page } from "@/lib/supabase/types";

interface EditPageFormProps {
  page: Page;
  siteUrl: string;
}

export function EditPageForm({ page, siteUrl }: EditPageFormProps) {
  const router = useRouter();
  const [slug, setSlug] = useState(page.slug);
  const [title, setTitle] = useState(page.title);
  const [bio, setBio] = useState(page.bio ?? "");
  const [isActive, setIsActive] = useState(page.is_active);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugOk, setSlugOk] = useState(true); // current slug is already valid
  const [checking, setChecking] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const boundUpdatePage = updatePage.bind(null, page.id);
  const [state, formAction, pending] = useActionState(boundUpdatePage, null);

  // Show success flash
  useEffect(() => {
    if (state && "ok" in state) {
      setSaveSuccess(true);
      const t = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  // Debounced slug check
  useEffect(() => {
    if (slug === page.slug) {
      setSlugOk(true);
      setSlugError(null);
      return;
    }

    setSlugOk(false);
    setSlugError(null);

    if (!slug) return;

    const clientError = validateSlug(slug);
    if (clientError) {
      setSlugError(clientError);
      return;
    }

    setChecking(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const result = await checkSlugAvailable(slug, page.id);
      setChecking(false);
      if (result.available) {
        setSlugOk(true);
        setSlugError(null);
      } else {
        setSlugError(result.error ?? "Not available.");
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [slug, page.slug, page.id]);

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    const result = await deletePage(page.id);
    if ("error" in result) {
      setDeleteError(result.error);
      setDeleting(false);
    } else {
      router.push("/dashboard");
    }
  };

  const canSave = !slugError && slugOk && title.trim().length > 0;

  return (
    <div className="max-w-xl">
      <form action={formAction} className="space-y-5">
        {/* Hidden fields so form always sends current values */}
        <input type="hidden" name="is_active" value={String(isActive)} />

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-text-muted mb-1.5">
            Username
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-subtle select-none pointer-events-none">
              ultralink.bio/
            </span>
            <input
              id="slug"
              name="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(sanitizeSlug(e.target.value))}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className={[
                "w-full bg-surface-2 border text-text rounded-[var(--radius)] pl-[7.5rem] pr-10 py-3 text-sm transition-colors duration-150 focus:outline-none focus:ring-2",
                slugError
                  ? "border-red-500/60 focus:ring-red-500/30"
                  : slugOk
                  ? "border-emerald-500/40 focus:ring-emerald-500/20"
                  : "border-border-strong focus:ring-gold/40",
              ].join(" ")}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
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
          <p className="mt-1.5 text-xs text-text-subtle">
            Public URL:{" "}
            <a
              href={`${siteUrl}/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-bright transition-colors"
            >
              {siteUrl}/{page.slug}
            </a>
          </p>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-muted mb-1.5">
            Page title
          </label>
          <Input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. John's links"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-text-muted mb-1.5">
            Bio <span className="text-text-subtle font-normal">(optional)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short description about you or this page"
            rows={3}
            className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius)] px-4 py-3 text-sm resize-none transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40"
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-[var(--radius)]">
          <div>
            <p className="text-sm font-medium text-text">Page active</p>
            <p className="text-xs text-text-muted mt-0.5">
              {isActive ? "Visitors can see this page" : "Page is hidden from public"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((v) => !v)}
            className={[
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg cursor-pointer",
              isActive ? "bg-gold" : "bg-surface-2 border border-border-strong",
            ].join(" ")}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Server error */}
        {state && "error" in state && (
          <div role="alert" className="p-3 rounded-[var(--radius-sm)] bg-red-950/30 border border-red-800/30 text-sm text-red-400">
            {state.error}
          </div>
        )}

        {/* Success */}
        {saveSuccess && (
          <div role="status" className="p-3 rounded-[var(--radius-sm)] bg-emerald-950/30 border border-emerald-800/30 text-sm text-emerald-400">
            Changes saved!
          </div>
        )}

        {/* Save */}
        <Button
          type="submit"
          variant="gold"
          size="md"
          disabled={!canSave}
          loading={pending}
          className="w-full"
        >
          Save changes
        </Button>
      </form>

      {/* Danger zone */}
      <div className="mt-10 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-text-muted mb-3">Danger zone</h3>
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-sm text-red-400 border border-red-800/40 rounded-[var(--radius)] hover:bg-red-950/30 hover:text-red-300 transition-colors cursor-pointer"
          >
            Delete this page
          </button>
        ) : (
          <div className="p-4 bg-red-950/20 border border-red-800/30 rounded-[var(--radius)] space-y-3">
            <p className="text-sm text-red-300 font-medium">
              Are you sure? This cannot be undone.
            </p>
            <p className="text-xs text-text-muted">
              The URL <span className="text-text font-mono">{siteUrl}/{page.slug}</span> will stop working immediately.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm text-red-400 border border-red-800/40 rounded-[var(--radius)] hover:bg-red-950/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm text-text-muted border border-border rounded-[var(--radius)] hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            {deleteError && (
              <p className="text-xs text-red-400 mt-2">{deleteError}</p>
            )}
          </div>
        )}
      </div>

      {/* Back link */}
      <div className="mt-6">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-sm text-text-subtle hover:text-text-muted transition-colors"
        >
          ← Back to links
        </button>
      </div>
    </div>
  );
}
