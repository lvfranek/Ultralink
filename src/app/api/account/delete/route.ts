import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { confirmUsername } = await request.json();

  // Verify the user typed their own username
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.username !== confirmUsername) {
    return NextResponse.json({ error: "Username confirmation does not match." }, { status: 400 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json({ error: "Service not configured." }, { status: 500 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Stop billing before the account disappears. Deleting the Stripe customer
  // cancels all of its subscriptions immediately and removes the stored
  // payment details. If this fails, abort — never delete an account that
  // Stripe would keep charging.
  if (profile.stripe_customer_id) {
    try {
      await stripe.customers.del(profile.stripe_customer_id);
    } catch (err) {
      const alreadyGone = (err as { code?: string }).code === "resource_missing";
      if (!alreadyGone) {
        console.error("[account/delete] Stripe customer deletion failed", err);
        return NextResponse.json(
          { error: "We couldn't cancel your subscription, so your account was not deleted. Please try again or contact support." },
          { status: 500 }
        );
      }
    }
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    // Billing is already gone — don't leave a pointer to the deleted customer
    if (profile.stripe_customer_id) {
      await admin
        .from("profiles")
        .update({ stripe_customer_id: null, stripe_subscription_id: null })
        .eq("id", user.id);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
