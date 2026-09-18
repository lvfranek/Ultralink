export const RESERVED_SLUGS = new Set([
  "login",
  "register",
  "signup",
  "dashboard",
  "privacy",
  "terms",
  "imprint",
  "auth",
  "api",
  "_next",
  "admin",
  "settings",
  "pricing",
  "about",
  "help",
  "support",
  "app",
  "static",
  "assets",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}
