import { isReservedSlug } from "@/lib/config/reserved-slugs";

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/;

export function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateSlug(slug: string): string | null {
  if (!slug) return "Username is required.";
  if (slug.length < 2) return "Username must be at least 2 characters.";
  if (slug.length > 30) return "Username must be 30 characters or fewer.";
  if (!SLUG_REGEX.test(slug))
    return "Only lowercase letters, numbers, and hyphens. Must start and end with a letter or number.";
  if (isReservedSlug(slug)) return "That username is reserved.";
  return null;
}
