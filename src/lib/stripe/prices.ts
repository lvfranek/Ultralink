import type { BillingInterval, Tier } from "@/lib/config/pricing";

export function getPriceId(tier: Tier, interval: BillingInterval): string {
  const key = `STRIPE_PRICE_${tier}_${interval.toUpperCase()}` as keyof NodeJS.ProcessEnv;
  const id = process.env[key];
  if (!id) throw new Error(`Missing env var: ${key}`);
  return id;
}
