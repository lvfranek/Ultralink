/**
 * The canonical site URL. Reads from NEXT_PUBLIC_SITE_URL.
 * In development, falls back to http://localhost:3000.
 * In production, a missing value is a misconfiguration — fail loudly.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    throw new Error("[getSiteUrl] NEXT_PUBLIC_SITE_URL is not set in production.");
  }
  return "http://localhost:3000";
}
