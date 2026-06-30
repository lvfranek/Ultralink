import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

async function syncSubscription(
  supabase: ReturnType<typeof createServiceClient>,
  sub: Stripe.Subscription,
  userId?: string
) {
  // Resolve user_id from subscription metadata or provided argument
  const uid = userId ?? sub.metadata?.user_id;
  if (!uid) {
    console.warn("[webhook] No user_id on subscription", sub.id);
    return;
  }

  const item = sub.items.data[0];
  const price = item?.price as Stripe.Price | undefined;
  const tier = price?.metadata?.tier ? parseInt(price.metadata.tier) : null;
  const interval: string | null = price?.metadata?.interval ?? null;

  const status =
    sub.status === "trialing"
      ? "trialing"
      : sub.status === "active"
      ? "active"
      : sub.status === "past_due"
      ? "grace"
      : "canceled";

  // current_period_end can live on the subscription root OR on items[0],
  // depending on Stripe API version. Read with fallback, guard against null.
  const rawPeriodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    sub.items?.data?.[0]?.current_period_end ??
    null;

  const currentPeriodEnd =
    typeof rawPeriodEnd === "number" && Number.isFinite(rawPeriodEnd)
      ? new Date(rawPeriodEnd * 1000).toISOString()
      : null;

  const updates: Record<string, unknown> = {
    stripe_subscription_id: sub.id,
    plan_tier: tier,
    plan_interval: interval,
    subscription_status: status,
    grace_period_ends_at: null,
  };
  if (currentPeriodEnd) updates.current_period_end = currentPeriodEnd;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", uid);

  if (error) console.error("[webhook] syncSubscription error", error);
  else console.log("[webhook] synced subscription", sub.id, "→", status, "uid:", uid);
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("[webhook] signature verification failed:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId = session.metadata?.user_id ?? undefined;
        const subId = session.subscription;
        if (!subId) break;

        const sub = await stripe.subscriptions.retrieve(subId as string);
        await syncSubscription(supabase, sub, userId);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(supabase, sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata?.user_id;
        if (!uid) { console.warn("[webhook] deleted sub has no user_id", sub.id); break; }

        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: "canceled",
            plan_tier: null,
            plan_interval: null,
            grace_period_ends_at: null,
            current_period_end: null,
          })
          .eq("id", uid);

        if (error) console.error("[webhook] delete sub error", error);
        else console.log("[webhook] subscription deleted uid:", uid);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = (invoice as unknown as { subscription: string | null }).subscription;
        if (!sub) break;

        const subscription = await stripe.subscriptions.retrieve(sub);
        const uid = subscription.metadata?.user_id;
        if (!uid) break;

        const graceEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await supabase
          .from("profiles")
          .update({ subscription_status: "grace", grace_period_ends_at: graceEnd })
          .eq("id", uid);

        if (error) console.error("[webhook] payment_failed error", error);
        else console.log("[webhook] entered grace period uid:", uid, "until", graceEnd);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const sub = (invoice as unknown as { subscription: string | null }).subscription;
        if (!sub) break;

        const subscription = await stripe.subscriptions.retrieve(sub);
        const uid = subscription.metadata?.user_id;
        if (!uid) break;

        const rawPeriodEnd =
          (subscription as unknown as { current_period_end?: number }).current_period_end ??
          subscription.items?.data?.[0]?.current_period_end ??
          null;
        const currentPeriodEnd =
          typeof rawPeriodEnd === "number" && Number.isFinite(rawPeriodEnd)
            ? new Date(rawPeriodEnd * 1000).toISOString()
            : null;

        const paymentSucceededUpdates: Record<string, unknown> = {
          subscription_status: "active",
          grace_period_ends_at: null,
        };
        if (currentPeriodEnd) paymentSucceededUpdates.current_period_end = currentPeriodEnd;

        const { error } = await supabase
          .from("profiles")
          .update(paymentSucceededUpdates)
          .eq("id", uid)
          .in("subscription_status", ["grace", "active", "trialing"]);

        if (error) console.error("[webhook] payment_succeeded error", error);
        else console.log("[webhook] payment succeeded uid:", uid);
        break;
      }

      default:
        console.log("[webhook] unhandled event", event.type);
    }
  } catch (err) {
    console.error("[webhook] handler error", event.type, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
