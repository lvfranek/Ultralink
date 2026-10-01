// Names that can't be claimed as ultralink.bio/<name>. Next.js serves its own
// routes before the [slug] page, so a user page with one of these names would be
// unreachable. reserved-slugs.test.ts fails when a new top-level route is missing.
const RESERVED_SLUGS = new Set([
  // Routes in src/app
  "admin",
  "api",
  "auth",
  "checkout",
  "dashboard",
  "help",
  "imprint",
  "invite",
  "login",
  "opengraph-image",
  "privacy",
  "r",
  "reset-password",
  "terms",

  // Framework paths and folders in public/
  "_next",
  "assets",
  "favicon",
  "static",

  // Pages we may add later, and URLs people try out of habit
  "about",
  "account",
  "app",
  "billing",
  "blog",
  "contact",
  "docs",
  "forgot-password",
  "logout",
  "pricing",
  "register",
  "settings",
  "sign-in",
  "sign-up",
  "signin",
  "signout",
  "signup",
  "status",
  "support",

  // Brand
  "ultralink",
  "www",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}
