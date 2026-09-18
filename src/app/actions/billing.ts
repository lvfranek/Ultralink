"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { stripe } from "@/lib/stripe/server";
import { getPriceId } from "@/lib/stripe/prices";
import { getSiteUrl } from "@/lib/site-url";
import type { BillingInterval, Tier } from "@/lib/config/pricing";

type CheckoutResult = { url: string } | { loginUrl: string } | { error: string };

export async function startCheckout({
  tier,
  interval,
}: {
  tier: Tier;
  interval: BillingInterval;
}): Promise<CheckoutResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const next = encodeURIComponent(`/checkout?tier=${tier}&interval=${interval}`);
    return { loginUrl: `/login?next=${next}` };
  }

  return createCheckoutSession({ tier, interval });
}

export async function createCheckoutSession({
  tier,
  interval,
}: {
  tier: Tier;
  interval: BillingInterval;
}): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Ensure stripe customer exists
  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    // Billing columns aren't user-writable (see 20260911_lock_profile_columns.sql)
    await createServiceClient().from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  let priceId: string;
  try {
    priceId = getPriceId(tier, interval);
  } catch {
    return { error: "Invalid plan selection." };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getSiteUrl()}/dashboard?upgraded=1`,
    cancel_url: `${getSiteUrl()}/#pricing`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { user_id: user.id, tier: String(tier), interval },
    },
  });

  if (!session.url) return { error: "Failed to create checkout session." };
  return { url: session.url };
}

export async function createPortalSession(): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single();

  if (!profile?.stripe_customer_id) {
    return { error: "No active subscription." };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${getSiteUrl()}/dashboard/account`,
  });

  return { url: session.url };
}
