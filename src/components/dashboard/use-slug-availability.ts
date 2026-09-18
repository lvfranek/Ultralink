import { useEffect, useState } from "react";
import { validateSlug } from "@/lib/slug";
import { checkSlugAvailable } from "@/app/actions/pages";

type CheckResult = { slug: string; available: boolean; error: string | null };

/**
 * Live "is this slug free?" check. The format is validated instantly; the
 * server is asked after a 400ms pause in typing.
 *
 * `currentSlug` is the page's existing slug (always OK, never re-checked);
 * `excludePageId` stops a page from colliding with itself.
 */
export function useSlugAvailability(
  slug: string,
  { currentSlug, excludePageId }: { currentSlug?: string; excludePageId?: string } = {},
) {
  const [result, setResult] = useState<CheckResult | null>(null);

  const unchanged = currentSlug !== undefined && slug === currentSlug;
  const formatError = !slug || unchanged ? null : validateSlug(slug);
  const needsCheck = !!slug && !unchanged && !formatError;

  useEffect(() => {
    if (!needsCheck) return;
    const timer = setTimeout(async () => {
      const res = await checkSlugAvailable(slug, excludePageId);
      setResult({ slug, available: res.available, error: res.available ? null : (res.error ?? "Not available.") });
    }, 400);
    return () => clearTimeout(timer);
  }, [needsCheck, slug, excludePageId]);

  // A result only counts for the slug it was fetched for — a late answer for
  // an older value is ignored.
  const current = needsCheck && result?.slug === slug ? result : null;

  return {
    slugOk: unchanged || !!current?.available,
    slugError: formatError ?? current?.error ?? null,
    checking: needsCheck && !current,
  };
}
