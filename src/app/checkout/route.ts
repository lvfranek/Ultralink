import { redirect } from "next/navigation";
import { createCheckoutSession } from "@/app/actions/billing";
import type { Tier } from "@/lib/config/pricing";
import { TIERS } from "@/lib/config/pricing";
import type { BillingInterval } from "@/lib/config/pricing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawTier = parseInt(searchParams.get("tier") ?? "1");
  const tier = (TIERS.includes(rawTier as Tier) ? rawTier : 1) as Tier;
  const interval = (searchParams.get("interval") ?? "monthly") as BillingInterval;

  const result = await createCheckoutSession({ tier, interval });

  if ("url" in result) redirect(result.url);
  redirect("/dashboard?error=checkout_failed");
}
