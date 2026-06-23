"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PageLink } from "@/lib/supabase/types";

export type LinkActionResult = { error: string } | { ok: true; link?: PageLink };

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function verifyPageOwnership(supabase: Awaited<ReturnType<typeof createClient>>, pageId: string, userId: string): Promise<boolean> {
  const { count } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("id", pageId)
    .eq("owner_id", userId);
  return (count ?? 0) > 0;
}

export async function addLink(
  pageId: string,
  data: { label: string; url: string; icon?: string; thumbnail_url?: string; is_adult?: boolean }
): Promise<LinkActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!isValidUrl(data.url)) return { error: "URL must start with http:// or https://" };
  if (!data.label.trim()) return { error: "Label is required." };

  const owns = await verifyPageOwnership(supabase, pageId, user.id);
  if (!owns) return { error: "Page not found." };

  const { count } = await supabase
    .from("page_links")
    .select("*", { count: "exact", head: true })
    .eq("page_id", pageId);

  const nextPos = (count ?? 0);

  const { data: link, error } = await supabase
    .from("page_links")
    .insert({
      page_id: pageId,
      label: data.label.trim(),
      url: data.url.trim(),
      icon: data.icon ?? null,
      thumbnail_url: data.thumbnail_url ?? null,
      is_adult: data.is_adult ?? false,
      position: nextPos,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/links/${pageId}`);
  return { ok: true, link: link as PageLink };
}

export async function updateLink(
  id: string,
  data: { label?: string; url?: string; icon?: string | null; thumbnail_url?: string | null; is_adult?: boolean; is_active?: boolean }
): Promise<LinkActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (data.url !== undefined && !isValidUrl(data.url)) {
    return { error: "URL must start with http:// or https://" };
  }

  const { data: existing } = await supabase
    .from("page_links")
    .select("page_id")
    .eq("id", id)
    .single();

  if (!existing) return { error: "Link not found." };

  const owns = await verifyPageOwnership(supabase, existing.page_id, user.id);
  if (!owns) return { error: "Not authorized." };

  const { error } = await supabase
    .from("page_links")
    .update({
      ...(data.label !== undefined ? { label: data.label.trim() } : {}),
      ...(data.url !== undefined ? { url: data.url.trim() } : {}),
      ...(data.icon !== undefined ? { icon: data.icon } : {}),
      ...(data.thumbnail_url !== undefined ? { thumbnail_url: data.thumbnail_url } : {}),
      ...(data.is_adult !== undefined ? { is_adult: data.is_adult } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/links/${existing.page_id}`);
  return { ok: true };
}

export async function deleteLink(id: string): Promise<LinkActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("page_links")
    .select("page_id")
    .eq("id", id)
    .single();

  if (!existing) return { error: "Link not found." };

  const owns = await verifyPageOwnership(supabase, existing.page_id, user.id);
  if (!owns) return { error: "Not authorized." };

  const { error } = await supabase.from("page_links").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/links/${existing.page_id}`);
  return { ok: true };
}

export async function reorderLinks(
  pageId: string,
  orderedIds: string[]
): Promise<LinkActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const owns = await verifyPageOwnership(supabase, pageId, user.id);
  if (!owns) return { error: "Page not found." };

  const updates = orderedIds.map((id, position) =>
    supabase.from("page_links").update({ position }).eq("id", id).eq("page_id", pageId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath(`/dashboard/links/${pageId}`);
  return { ok: true };
}
