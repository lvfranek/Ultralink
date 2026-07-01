"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOwnerId } from "@/lib/team";
import type { PageLink } from "@/lib/supabase/types";

export type LinkActionResult = { error: string } | { ok: true; link?: PageLink };

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

async function verifyPageOwnership(supabase: Awaited<ReturnType<typeof createClient>>, pageId: string, activeOwnerId: string): Promise<boolean> {
  const { count } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("id", pageId)
    .eq("owner_id", activeOwnerId);
  return (count ?? 0) > 0;
}

export async function addLink(
  pageId: string,
  data: {
    label: string; url: string; icon?: string; thumbnail_url?: string; is_adult?: boolean;
    fill_type?: string; fill_value?: string; text_color?: string; corner?: string; animation?: string;
    item_type?: "button" | "heading";
  }
): Promise<LinkActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isHeading = data.item_type === "heading";

  if (!isHeading && !data.label.trim()) return { error: "Label is required." };

  let normalizedUrl = "";
  if (!isHeading) {
    normalizedUrl = normalizeUrl(data.url);
    if (!isValidUrl(normalizedUrl)) return { error: "Please enter a valid URL." };
  }

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);
  const owns = await verifyPageOwnership(supabase, pageId, activeOwnerId);
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
      url: normalizedUrl,
      icon: data.icon ?? null,
      thumbnail_url: data.thumbnail_url ?? null,
      is_adult: data.is_adult ?? false,
      fill_type: data.fill_type ?? 'color',
      fill_value: data.fill_value ?? '#06AEEF',
      text_color: data.text_color ?? '#FFFFFF',
      corner: data.corner ?? 'pill',
      animation: data.animation ?? 'none',
      item_type: data.item_type ?? 'button',
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
  data: {
    label?: string; url?: string; icon?: string | null; thumbnail_url?: string | null;
    is_adult?: boolean; is_active?: boolean;
    fill_type?: string; fill_value?: string; text_color?: string; corner?: string; animation?: string;
  }
): Promise<LinkActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("page_links")
    .select("page_id, item_type")
    .eq("id", id)
    .single();

  if (!existing) return { error: "Link not found." };

  const isHeading = existing.item_type === "heading";

  let normalizedUrl: string | undefined;
  if (!isHeading && data.url !== undefined) {
    normalizedUrl = normalizeUrl(data.url);
    if (!isValidUrl(normalizedUrl)) return { error: "Please enter a valid URL." };
  }

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);
  const owns = await verifyPageOwnership(supabase, existing.page_id, activeOwnerId);
  if (!owns) return { error: "Not authorized." };

  const { error } = await supabase
    .from("page_links")
    .update({
      ...(data.label !== undefined ? { label: data.label.trim() } : {}),
      ...(normalizedUrl !== undefined ? { url: normalizedUrl } : {}),
      ...(data.icon !== undefined ? { icon: data.icon } : {}),
      ...(data.thumbnail_url !== undefined ? { thumbnail_url: data.thumbnail_url } : {}),
      ...(data.is_adult !== undefined ? { is_adult: data.is_adult } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
      ...(data.fill_type !== undefined ? { fill_type: data.fill_type } : {}),
      ...(data.fill_value !== undefined ? { fill_value: data.fill_value } : {}),
      ...(data.text_color !== undefined ? { text_color: data.text_color } : {}),
      ...(data.corner !== undefined ? { corner: data.corner } : {}),
      ...(data.animation !== undefined ? { animation: data.animation } : {}),
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

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);
  const owns = await verifyPageOwnership(supabase, existing.page_id, activeOwnerId);
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

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);
  const owns = await verifyPageOwnership(supabase, pageId, activeOwnerId);
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

/** Apply a preset's default link style to all links on a page at once. */
export async function applyPresetToLinks(
  pageId: string,
  style: { fill_type: string; fill_value: string; text_color: string; corner: string; animation: string }
): Promise<LinkActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);
  const owns = await verifyPageOwnership(supabase, pageId, activeOwnerId);
  if (!owns) return { error: "Page not found." };

  const { error } = await supabase
    .from("page_links")
    .update({
      fill_type: style.fill_type,
      fill_value: style.fill_value,
      text_color: style.text_color,
      corner: style.corner,
      animation: style.animation,
    })
    .eq("page_id", pageId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/links/${pageId}`);
  return { ok: true };
}
