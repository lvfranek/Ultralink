"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { validateSlug } from "@/lib/slug";
import { useSlugAvailability } from "@/components/dashboard/use-slug-availability";
import { cx, Dialog } from "./ui";
import s from "./app.module.css";

/** Says exactly what's wrong with a name; validateSlug (the server's rules) stays the final word */
export function slugProblem(value: string): string | null {
  if (/\s/.test(value)) return "Spaces aren't allowed. Try a hyphen instead.";
  const bad = value.match(/[^a-z0-9-]/);
  if (bad) return `“${bad[0]}” isn't allowed. Use letters, numbers and hyphens.`;
  if (/^-|-$/.test(value)) return "Can't start or end with a hyphen.";
  if (value.length < 2) return "At least 2 characters.";
  if (value.length > 30) return "30 characters max.";
  const real = validateSlug(value);
  if (real?.includes("reserved")) return "That name is reserved.";
  return real;
}

export type SlugStatus = "idle" | "checking" | "available" | "unavailable" | "invalid";

/**
 * Live check for an ultralink.bio/ name: format first (instantly), then the
 * server, after a short pause in typing. `currentSlug` counts as fine as-is.
 */
export function useSlugField(initial = "", opts: { currentSlug?: string; excludePageId?: string } = {}) {
  const [slug, setSlug] = useState(initial);
  const unchanged = opts.currentSlug !== undefined && slug === opts.currentSlug;
  const problem = !slug || unchanged ? null : slugProblem(slug);
  const { slugOk, slugError, checking } = useSlugAvailability(problem ? "" : slug, opts);

  const status: SlugStatus = !slug
    ? "idle"
    : unchanged
      ? "available"
      : problem
        ? "invalid"
        : checking
          ? "checking"
          : slugOk
            ? "available"
            : slugError
              ? "unavailable"
              : "checking";

  const hint =
    status === "invalid"
      ? problem
      : status === "unavailable"
        ? slugError?.replace("username", "name")
        : status === "checking"
          ? "Checking…"
          : status === "available" && !unchanged
            ? `ultralink.bio/${slug} is available`
            : "";

  return {
    slug,
    status,
    hint,
    failed: status === "invalid" || status === "unavailable",
    // Uppercase is simply lowered; anything else invalid stays visible and is flagged
    change: (raw: string) => setSlug(raw.toLowerCase()),
  };
}

/** The ultralink.bio/ input with its live hint, shared by the dialogs and the editor */
export function SlugInput({
  id,
  field,
  autoFocus,
  quiet,
}: {
  id: string;
  field: ReturnType<typeof useSlugField>;
  autoFocus?: boolean;
  /** Hide the hint while the value is unchanged (editor) */
  quiet?: boolean;
}) {
  const { slug, status, hint, failed, change } = field;
  return (
    <>
      <div className={cx(s.prefixed, failed && s.inputError)}>
        <span>ultralink.bio/</span>
        <input
          id={id}
          className={s.input}
          value={slug}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="yourname"
          aria-invalid={failed}
          aria-describedby={`${id}-hint`}
          onChange={(e) => change(e.target.value)}
        />
      </div>
      <p
        id={`${id}-hint`}
        className={cx(s.hint, status === "available" && hint && s.ok, failed && s.err)}
        aria-live="polite"
      >
        {!(quiet && !hint) && (
          <>
            {status === "checking" && <Loader2 size={13} className={s.spin} aria-hidden="true" />}
            {status === "available" && hint && <Check size={13} strokeWidth={3} aria-hidden="true" />}
            {failed && <X size={13} strokeWidth={3} aria-hidden="true" />}
            {hint}
          </>
        )}
      </p>
    </>
  );
}

/** Asks for a new ultralink.bio/ name: "New page" and "Duplicate" */
export function SlugDialog({
  title,
  description,
  submitLabel,
  initialSlug = "",
  pending = false,
  error,
  onSubmit,
  onClose,
}: {
  title: string;
  description: string;
  submitLabel: string;
  initialSlug?: string;
  pending?: boolean;
  /** Returned by the server after submitting */
  error?: string | null;
  onSubmit: (slug: string) => void;
  onClose: () => void;
}) {
  const field = useSlugField(initialSlug);
  const ready = field.status === "available" && !pending;

  return (
    <Dialog title={title} description={description} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onSubmit(field.slug);
        }}
      >
        <div className={s.field}>
          <label className={s.label} htmlFor="slug-dialog-input">
            Link
          </label>
          <SlugInput id="slug-dialog-input" field={field} autoFocus />
        </div>
        {error && <p className={cx(s.hint, s.err)}>{error}</p>}
        <div className={s.dialogActions}>
          <button type="button" className={s.btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={s.btnLight} disabled={!ready}>
            {pending && <Loader2 size={15} className={s.spin} aria-hidden="true" />}
            {submitLabel}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

/** Shown instead of SlugDialog when the plan's page limit is reached */
export function LimitDialog({ cap, onUpgrade, onClose }: { cap: number; onUpgrade: () => void; onClose: () => void }) {
  return (
    <Dialog
      title="You've used all your pages"
      description={`Your plan includes ${cap} link ${cap === 1 ? "page" : "pages"}. Upgrade to add more. Everything else stays exactly as it is.`}
      onClose={onClose}
    >
      <div className={s.dialogActions}>
        <button type="button" className={s.btnGhost} onClick={onClose}>
          Not now
        </button>
        <button type="button" className={s.btnLight} onClick={onUpgrade}>
          <Sparkles size={15} aria-hidden="true" /> See plans
        </button>
      </div>
    </Dialog>
  );
}
