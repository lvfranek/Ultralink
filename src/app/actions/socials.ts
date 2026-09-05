"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOwnerId } from "@/lib/team";
import { normalizeUrl, isValidUrl } from "@/lib/url";
import type { PageSocial } from "@/lib/supabase/types";

const MAX_SOCIALS = 20;

export type SocialActionResult = { error: string } | { ok: true; social?: PageSocial };

async function verifyPageOwnership(supabase: Awaited<ReturnType<typeof createClient>>, pageId: string, activeOwnerId: string): Promise<boolean> {
  const { count } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("id", pageId)
    .eq("owner_id", activeOwnerId);
  return (count ?? 0) > 0;
}

export async function addSocial(
  pageId: string,
  data: { platform: string; url: string }
): Promise<SocialActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!data.url.trim()) return { error: "URL is required." };
  if (!data.platform) return { error: "Platform is required." };

  const normalizedUrl = normalizeUrl(data.url);
  if (!isValidUrl(normalizedUrl)) return { error: "Please enter a valid URL." };

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);
  const owns = await verifyPageOwnership(supabase, pageId, activeOwnerId);
  if (!owns) return { error: "Page not found." };

  const { count } = await supabase
    .from("page_socials")
    .select("*", { count: "exact", head: true })
    .eq("page_id", pageId);

  if ((count ?? 0) >= MAX_SOCIALS) {
    return { error: `You can add up to ${MAX_SOCIALS} social links per page.` };
  }

  const { data: social, error } = await supabase
    .from("page_socials")
    .insert({
      page_id: pageId,
      platform: data.platform,
      url: normalizedUrl,
      position: count ?? 0,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/links/${pageId}`);
  return { ok: true, social: social as PageSocial };
}

export async function updateSocial(
  id: string,
  data: { platform?: string; url?: string }
): Promise<SocialActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("page_socials")
    .select("page_id")
    .eq("id", id)
    .single();

  if (!existing) return { error: "Social link not found." };

  let normalizedUrl: string | undefined;
  if (data.url !== undefined) {
    if (!data.url.trim()) return { error: "URL is required." };
    normalizedUrl = normalizeUrl(data.url);
    if (!isValidUrl(normalizedUrl)) return { error: "Please enter a valid URL." };
  }

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);
  const owns = await verifyPageOwnership(supabase, existing.page_id, activeOwnerId);
  if (!owns) return { error: "Not authorized." };

  const { error } = await supabase
    .from("page_socials")
    .update({
      ...(data.platform !== undefined ? { platform: data.platform } : {}),
      ...(normalizedUrl !== undefined ? { url: normalizedUrl } : {}),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/links/${existing.page_id}`);
  return { ok: true };
}

export async function deleteSocial(id: string): Promise<SocialActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("page_socials")
    .select("page_id")
    .eq("id", id)
    .single();

  if (!existing) return { error: "Social link not found." };

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);
  const owns = await verifyPageOwnership(supabase, existing.page_id, activeOwnerId);
  if (!owns) return { error: "Not authorized." };

  const { error } = await supabase.from("page_socials").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/links/${existing.page_id}`);
  return { ok: true };
}

export async function reorderSocials(
  pageId: string,
  orderedIds: string[]
): Promise<SocialActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);
  const owns = await verifyPageOwnership(supabase, pageId, activeOwnerId);
  if (!owns) return { error: "Page not found." };

  const updates = orderedIds.map((id, position) =>
    supabase.from("page_socials").update({ position }).eq("id", id).eq("page_id", pageId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath(`/dashboard/links/${pageId}`);
  return { ok: true };
}
