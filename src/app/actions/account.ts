"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSiteUrl } from "@/lib/site-url";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function emailInUse(email: string): Promise<boolean> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`;
  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
    cache: "no-store",
  });
  if (!res.ok) return false;
  const data = await res.json();
  const users: Array<{ email?: string }> = Array.isArray(data?.users) ? data.users : [];
  const normalized = email.toLowerCase();
  // Both confirmed and unconfirmed accounts count as "in use" — don't leak confirmation state.
  return users.some((u) => u.email?.toLowerCase() === normalized);
}

export async function resendConfirmationEmail(email: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: `${getSiteUrl()}/dashboard` },
  });
  if (error) return { error: error.message };
  return {};
}

export async function checkUsernameAvailable(
  username: string,
  excludeId?: string
): Promise<{ available: boolean }> {
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { available } = await checkUsernameAvailable(username, user.id);
  if (!available) return { error: "That username is already taken." };

  const { data, error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", user.id)
    .select("id");

  if (error) return { error: error.message };
  if (!data || data.length === 0) {
    // Row missing or RLS blocked the update — upsert as fallback
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, username }, { onConflict: "id" });
    if (upsertError) return { error: upsertError.message };
  }

  revalidatePath("/dashboard/account", "layout");
  revalidatePath("/dashboard", "layout");
  return {};
}

export async function updateEmail(
  newEmail: string,
  currentPassword: string
): Promise<{ error?: string; message?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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

export async function updatePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ error?: string }> {
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
