"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateSlug } from "@/lib/slug";
import { getLinkCap } from "@/lib/config/pricing";

export type ActionResult =
  | { error: string }
  | { ok: true }
  | { ok: true; pageId: string };

// createPage returns the new page's id so the client can navigate.
// Do NOT call redirect() here — it silently breaks when used inside useActionState.
export async function createPage(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const slug = ((formData.get("slug") as string) ?? "").toLowerCase().trim();
  const title = ((formData.get("title") as string) ?? "").trim();

  const slugError = validateSlug(slug);
  if (slugError) return { error: slugError };
  if (!title) return { error: "Title is required." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, grace_period_ends_at, plan_tier")
    .eq("id", user.id)
    .single();

  const cap = getLinkCap(
    profile ?? { subscription_status: "none", grace_period_ends_at: null, plan_tier: null }
  );

  const { count } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  if ((count ?? 0) >= cap) {
    return {
      error: `You've reached your plan's link limit. Upgrade to add more.`,
    };
  }

  const { data: page, error } = await supabase
    .from("pages")
    .insert({ owner_id: user.id, slug, title })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") return { error: "That username is already taken." };
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true, pageId: page.id };
}

export async function updatePage(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const slug = ((formData.get("slug") as string) ?? "").toLowerCase().trim();
  const title = ((formData.get("title") as string) ?? "").trim();
  const bio = ((formData.get("bio") as string) ?? "").trim();
  const is_active = formData.get("is_active") === "true";
  const avatar_url = (formData.get("avatar_url") as string | null) ?? undefined;
  const avatar_style = (formData.get("avatar_style") as string | null) ?? undefined;
  const active_badge = formData.get("active_badge") === "true";
  const age_gate_enabled = formData.get("age_gate_enabled") === "true";

  const blockedCountriesStr = formData.get("blocked_countries") as string | null;
  let blocked_countries: string[] = [];
  if (blockedCountriesStr) {
    try {
      const parsed = JSON.parse(blockedCountriesStr);
      if (Array.isArray(parsed)) {
        blocked_countries = parsed.filter(
          (c: unknown) => typeof c === "string" && /^[A-Z]{2}$/.test(c)
        );
      }
    } catch {
      // ignore invalid JSON — default to empty
    }
  }

  const winBackStr = formData.get("win_back") as string | null;
  let win_back: { enabled: boolean; headline: string; url: string } = { enabled: false, headline: "", url: "" };
  if (winBackStr) {
    try {
      const parsed = JSON.parse(winBackStr);
      if (parsed && typeof parsed === "object") {
        const enabled = !!parsed.enabled;
        const headline = String(parsed.headline ?? "").slice(0, 80);
        const url = String(parsed.url ?? "");
        if (enabled && url && !/^https?:\/\//i.test(url)) {
          return { error: "Win-Back URL must start with http:// or https://" };
        }
        win_back = { enabled, headline, url };
      }
    } catch {
      // ignore invalid JSON
    }
  }

  const themeStr = formData.get("theme") as string | null;
  let theme: Record<string, unknown> | undefined;
  if (themeStr) {
    try {
      theme = JSON.parse(themeStr);
    } catch {
      return { error: "Invalid theme data." };
    }
  }

  const slugError = validateSlug(slug);
  if (slugError) return { error: slugError };
  if (!title) return { error: "Title is required." };

  if (avatar_style && avatar_style !== "circle" && avatar_style !== "hero") {
    return { error: "Invalid avatar style." };
  }

  const { data: existing } = await supabase
    .from("pages")
    .select("id, slug")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!existing) return { error: "Page not found." };

  if (slug !== existing.slug) {
    const { count } = await supabase
      .from("pages")
      .select("*", { count: "exact", head: true })
      .eq("slug", slug)
      .neq("id", id);
    if ((count ?? 0) > 0) return { error: "That username is already taken." };
  }

  const { error } = await supabase
    .from("pages")
    .update({
      slug,
      title,
      bio,
      is_active,
      age_gate_enabled,
      active_badge,
      blocked_countries,
      win_back,
      updated_at: new Date().toISOString(),
      ...(avatar_url !== undefined ? { avatar_url } : {}),
      ...(avatar_style !== undefined ? { avatar_style } : {}),
      ...(theme !== undefined ? { theme } : {}),
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) {
    if (error.code === "23505") return { error: "That username is already taken." };
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${slug}`);
  return { ok: true };
}

// Returns { ok: true } so the client can navigate away after delete.
export async function deletePage(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function togglePageActive(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("pages")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function checkSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<{ available: boolean; error?: string }> {
  const validationError = validateSlug(slug);
  if (validationError) return { available: false, error: validationError };

  const supabase = await createClient();
  let query = supabase
    .from("pages")
    .select("id", { count: "exact", head: true })
    .eq("slug", slug);

  if (excludeId) query = query.neq("id", excludeId);

  const { count } = await query;
  if ((count ?? 0) > 0)
    return { available: false, error: "That username is already taken." };

  return { available: true };
}
