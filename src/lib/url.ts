export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Makes a user-supplied redirect target (e.g. `?next=`) safe: only paths on
 * this site are allowed. Browsers read `//evil.com`, `/\evil.com` and even
 * `/<tab>/evil.com` as other sites, so the URL parser decides, not a prefix check.
 */
export function safeRedirectPath(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  const base = "https://internal.invalid";
  try {
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
