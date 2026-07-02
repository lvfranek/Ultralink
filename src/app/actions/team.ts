"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { resend, inviteEmail } from "@/lib/resend";
import { isProActive } from "@/lib/supabase/types";
import { getSiteUrl } from "@/lib/site-url";

const ACTIVE_OWNER_COOKIE = "ultralink_active_owner";

export async function setActiveOwner(ownerId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Validate: either own account or a team they're an editor of
  let valid = ownerId === user.id;
  if (!valid) {
    const { data } = await supabase
      .from("team_members")
      .select("id")
      .eq("editor_id", user.id)
      .eq("owner_id", ownerId)
      .maybeSingle();
    valid = !!data;
  }
  if (!valid) return;

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_OWNER_COOKIE, ownerId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function inviteEditor(
  email: string
): Promise<{ error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { error: "Invalid email address." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, grace_period_ends_at, username")
    .eq("id", user.id)
    .single();

  if (!profile || !isProActive(profile)) {
    return { error: "Inviting team members requires an active Pro subscription." };
  }

  const service = createServiceClient();

  // Handle existing invite: auto-clean expired ones, surface pending ones clearly
  const { data: existing } = await service
    .from("team_invites")
    .select("id, accepted_at, expires_at")
    .eq("owner_id", user.id)
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (existing) {
    const isExpired = !existing.accepted_at && new Date(existing.expires_at) <= new Date();
    if (isExpired) {
      await service.from("team_invites").delete().eq("id", existing.id);
    } else {
      return { error: "An invite was already sent to this email. Resend or revoke it from the pending list above." };
    }
  }

  const token = crypto.randomBytes(24).toString("base64url");

  const { error: insertError } = await service.from("team_invites").insert({
    owner_id: user.id,
    email: normalizedEmail,
    token,
  });

  if (insertError) return { error: insertError.message };

  await resend.emails.send({
    from: "Ultralink <hello@ultralink.bio>",
    to: [normalizedEmail],
    subject: `${profile.username} invited you to Ultralink`,
    html: inviteEmail({
      ownerUsername: profile.username,
      token,
      siteUrl: getSiteUrl(),
    }),
  });

  revalidatePath("/dashboard/account");
  return {};
}

export async function resendInvite(
  inviteId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: invite } = await supabase
    .from("team_invites")
    .select("email, token")
    .eq("id", inviteId)
    .eq("owner_id", user.id)
    .is("accepted_at", null)
    .single();

  if (!invite) return { error: "Invite not found." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  await resend.emails.send({
    from: "Ultralink <hello@ultralink.bio>",
    to: [invite.email],
    subject: `${profile?.username ?? "Someone"} invited you to Ultralink`,
    html: inviteEmail({
      ownerUsername: profile?.username ?? "Someone",
      token: invite.token,
      siteUrl: getSiteUrl(),
    }),
  });

  return {};
}

export async function revokeInvite(
  inviteId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("team_invites")
    .delete()
    .eq("id", inviteId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/account");
  return {};
}

export async function removeEditor(
  editorId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("owner_id", user.id)
    .eq("editor_id", editorId);

  if (error) return { error: error.message };

  // Clean up the accepted invite so the owner can re-invite the same email
  const service = createServiceClient();
  const { data: editorAuth } = await service.auth.admin.getUserById(editorId);
  if (editorAuth.user?.email) {
    await service
      .from("team_invites")
      .delete()
      .eq("owner_id", user.id)
      .ilike("email", editorAuth.user.email);
  }

  revalidatePath("/dashboard/account");
  return {};
}

export async function acceptInvite(
  token: string
): Promise<{ error?: string } | { ok: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to accept an invite." };

  const service = createServiceClient();

  const { data: invite } = await service
    .from("team_invites")
    .select("id, owner_id, email, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) return { error: "This invite link is invalid or has already been used." };
  if (invite.accepted_at) return { error: "This invite has already been accepted." };
  if (new Date(invite.expires_at) < new Date()) {
    return { error: "This invite has expired. Ask the owner to send a new one." };
  }

  if (invite.email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return {
      error: `This invite was sent to ${invite.email}. Sign out and sign in with that account to accept.`,
    };
  }

  // Accept: insert team_member + mark invite accepted
  const now = new Date().toISOString();

  const { error: memberError } = await service.from("team_members").insert({
    owner_id: invite.owner_id,
    editor_id: user.id,
  });

  // Ignore duplicate (already a member)
  if (memberError && memberError.code !== "23505") {
    return { error: memberError.message };
  }

  await service
    .from("team_invites")
    .update({ accepted_at: now })
    .eq("id", invite.id);

  // Set active owner cookie to the new team
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_OWNER_COOKIE, invite.owner_id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return { ok: true };
}
