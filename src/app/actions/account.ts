"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSiteUrl } from "@/lib/site-url";
import { genericDbError } from "@/lib/db-error";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function resendConfirmationEmail(email: string): Promise<{ error?: string }> {
  // Supabase Auth already rate-limits the emails it sends; this is a second
  // layer against someone hammering the action itself.
  const ip = await getClientIp();
  if (!rateLimit(`resend-confirm:${ip}`, 5, 600).allowed) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${getSiteUrl()}/dashboard` },
  });
  if (error) return { error: error.message };
  return {};
}

async function checkUsernameAvailable(username: string, excludeId?: string): Promise<{ available: boolean }> {
  if (!USERNAME_RE.test(username)) return { available: false };
  const supabase = await createClient();
  let query = supabase.from("profiles").select("id").eq("username", username);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query.maybeSingle();
  return { available: !data };
}

export async function updateUsername(username: string): Promise<{ error?: string }> {
  if (!USERNAME_RE.test(username)) {
    return { error: "Invalid username format." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { available } = await checkUsernameAvailable(username, user.id);
  if (!available) return { error: "That username is already taken." };

  const { data, error } = await supabase.from("profiles").update({ username }).eq("id", user.id).select("id");

  if (error) return genericDbError("account.updateUsername", error);
  if (!data || data.length === 0) {
    // Row missing — insert it as a fallback
    const { error: upsertError } = await supabase.from("profiles").insert({ id: user.id, username });
    if (upsertError) return genericDbError("account.updateUsername.fallbackInsert", upsertError);
  }

  revalidatePath("/dashboard/account", "layout");
  revalidatePath("/dashboard", "layout");
  return {};
}

export async function updateEmail(
  newEmail: string,
  currentPassword: string,
): Promise<{ error?: string; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: "Not authenticated." };

  // Verify current password before changing email
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) return { error: "Current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) return { error: error.message };
  return { message: "Confirmation email sent to both addresses. Check your inbox." };
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<{ error?: string }> {
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: "Not authenticated." };

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) return { error: "Current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return {};
}
