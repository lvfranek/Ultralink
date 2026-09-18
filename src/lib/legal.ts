import { siteConfig } from "@/lib/config/site";

export interface LegalContact {
  name: string;
  street: string;
  city: string;
  country: string;
  email: string;
  phone: string | null;
  vatId: string | null;
}

/**
 * The operator's legal contact details for the Imprint and Privacy Policy.
 * Read from server-only env vars so the real address lives in the hosting
 * settings, never in the repository. Returns null when not configured
 * (e.g. a fresh clone), so pages can show a notice instead.
 */
export function getLegalContact(): LegalContact | null {
  const env = (key: string) => process.env[key]?.trim() || null;
  const name = env("IMPRINT_NAME");
  const street = env("IMPRINT_STREET");
  const city = env("IMPRINT_CITY");
  if (!name || !street || !city) return null;

  return {
    name,
    street,
    city,
    country: env("IMPRINT_COUNTRY") ?? "Germany",
    email: siteConfig.supportEmail,
    phone: env("IMPRINT_PHONE"),
    vatId: env("IMPRINT_VAT_ID"),
  };
}
