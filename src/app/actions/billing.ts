"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { getPriceId } from "@/lib/stripe/prices";
import type { BillingInterval, Tier } from "@/lib/config/pricing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
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
    success_url: `${SITE_URL}/dashboard?upgraded=1`,
    cancel_url: `${SITE_URL}/#pricing`,
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return { error: "No active subscription." };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${SITE_URL}/dashboard/account`,
  });

  return { url: session.url };
}
