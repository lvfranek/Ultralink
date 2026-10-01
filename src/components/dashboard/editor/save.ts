// Saving the editor: one Save writes everything, in an order where the most
// likely failures (link taken, invalid fields) happen before anything else changes.

import { updatePage } from "@/app/actions/pages";
import { addLink, applyPresetToLinks, deleteLink, reorderLinks, updateLink } from "@/app/actions/links";
import { addSocial, deleteSocial, reorderSocials, updateSocial } from "@/app/actions/socials";
import { buttonStyle, normalizeUrl, themeFromDraft, type Draft, type EdLink } from "./draft";

/** written: whether anything was stored before the failure (the page step is first and writes atomically) */
type Result = { error: string; written: boolean } | { ok: true };
const failed = (r: unknown): r is { error: string } => !!r && typeof r === "object" && "error" in r;

function linkChanged(a: EdLink, b: EdLink) {
  return (
    a.label !== b.label ||
    a.url !== b.url ||
    a.active !== b.active ||
    a.adult !== b.adult ||
    a.animation !== b.animation ||
    a.icon !== b.icon
  );
}

export async function saveDraft(pageId: string, slug: string, saved: Draft, draft: Draft): Promise<Result> {
  // 1. The page itself. Pro-only settings are locked on Free, so they're sent back
  //    unchanged: a lapsed subscriber keeps them for when they resubscribe.
  const form = new FormData();
  form.set("slug", slug);
  form.set("title", draft.name.trim());
  form.set("bio", draft.bio.trim());
  form.set("is_active", "true");
  form.set("avatar_url", draft.avatarUrl ?? "");
  form.set("avatar_style", draft.avatarStyle);
  form.set("active_badge", String(draft.badge));
  form.set("age_gate_enabled", String(draft.ageGate));
  form.set("theme", JSON.stringify(themeFromDraft(draft)));
  form.set("blocked_countries", JSON.stringify(draft.blockedCountries));
  form.set(
    "win_back",
    JSON.stringify({
      enabled: draft.winBack.enabled,
      headline: draft.winBack.headline.trim(),
      url: draft.winBack.url.trim() ? normalizeUrl(draft.winBack.url) : "",
      age_gate: draft.winBack.ageGate,
    }),
  );
  const page = await updatePage(pageId, null, form);
  if (failed(page)) return { error: page.error, written: false };
  try {
    const rest = await saveLists(pageId, saved, draft);
    return rest ? { error: rest, written: true } : { ok: true };
  } catch {
    return { error: "Some changes couldn't be saved. Please try again.", written: true };
  }
}

/** Links and social icons; returns an error message, or null when all went through */
async function saveLists(pageId: string, saved: Draft, draft: Draft): Promise<string | null> {
  // 2. Links: removed, added, changed
  const style = buttonStyle(draft);
  const before = new Map(saved.links.map((l) => [l.id, l]));
  const kept = new Set(draft.links.filter((l) => !l.isNew).map((l) => l.id));

  for (const l of saved.links) {
    if (kept.has(l.id)) continue;
    const r = await deleteLink(l.id);
    if (failed(r)) return r.error;
  }

  const ids: string[] = [];
  for (const l of draft.links) {
    if (l.isNew) {
      const r = await addLink(pageId, {
        label: l.label.trim(),
        url: l.kind === "button" ? normalizeUrl(l.url) : "",
        item_type: l.kind,
        icon: l.icon ?? undefined,
        is_adult: l.adult,
        animation: l.animation,
        ...(l.kind === "button" ? style : { text_color: "" }),
      });
      if (failed(r)) return r.error;
      if (!("link" in r) || !r.link) return "Couldn't add a link. Please try again.";
      ids.push(r.link.id);
      if (!l.active) {
        const off = await updateLink(r.link.id, { is_active: false });
        if (failed(off)) return off.error;
      }
      continue;
    }
    ids.push(l.id);
    const prev = before.get(l.id);
    if (!prev || linkChanged(prev, l)) {
      const r = await updateLink(l.id, {
        label: l.label.trim(),
        ...(l.kind === "button" ? { url: normalizeUrl(l.url) } : {}),
        icon: l.icon,
        is_adult: l.adult,
        is_active: l.active,
        animation: l.animation,
        // Headings use the theme's name colour; per-heading colours are gone
        ...(l.kind === "heading" ? { text_color: "" } : {}),
      });
      if (failed(r)) return r.error;
    }
  }

  const orderChanged = ids.join() !== saved.links.map((l) => l.id).join();
  if (orderChanged && ids.length) {
    const r = await reorderLinks(pageId, ids);
    if (failed(r)) return r.error;
  }

  // 3. One style for every button (also tidies pages saved with mixed styles)
  if (draft.links.some((l) => l.kind === "button")) {
    const r = await applyPresetToLinks(pageId, style);
    if (failed(r)) return r.error;
  }

  // 4. Social icons
  const socialsBefore = new Map(saved.socials.map((x) => [x.id, x]));
  const socialsKept = new Set(draft.socials.filter((x) => !x.isNew).map((x) => x.id));
  for (const x of saved.socials) {
    if (socialsKept.has(x.id)) continue;
    const r = await deleteSocial(x.id);
    if (failed(r)) return r.error;
  }
  const socialIds: string[] = [];
  for (const x of draft.socials) {
    if (x.isNew) {
      const r = await addSocial(pageId, { platform: x.platform, url: x.url.trim() });
      if (failed(r)) return r.error;
      if (!("social" in r) || !r.social) return "Couldn't add a social icon. Please try again.";
      socialIds.push(r.social.id);
      continue;
    }
    socialIds.push(x.id);
    if (socialsBefore.get(x.id)?.url !== x.url) {
      const r = await updateSocial(x.id, { url: x.url.trim() });
      if (failed(r)) return r.error;
    }
  }
  if (socialIds.join() !== saved.socials.map((x) => x.id).join() && socialIds.length) {
    const r = await reorderSocials(pageId, socialIds);
    if (failed(r)) return r.error;
  }

  return null;
}
