---
name: project-ultralink-phase2b
description: Phase 2B complete — tabbed page builder, avatar upload+crop, links/socials dnd-kit, age gate, Win-Back rename, migration SQL
metadata:
  type: project
---

Phase 2B done. Build passes clean.

**Why:** Turning the basic edit form into a full page builder with live preview.

**How to apply:** Next phase is 2C — visual styling (button colors, fonts, animations, Design tab, presets). Do NOT start 2C yet.

## What was built

**Quick fix:** "Traffic Recovery" renamed to "Win-Back" everywhere (traffic-recovery.tsx, faq.tsx, pricing.ts).

**New packages installed:** `react-easy-crop`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `lucide-react`.

**Schema additions** (SQL in `supabase/migrations/20260623_phase2b.sql`):
- `pages`: `avatar_style text default 'circle'`, `active_badge boolean default false`
- `page_links`: `icon text`, `thumbnail_url text`, `is_adult boolean default false`
- `page_socials`: new table (id, page_id, platform, url, position, created_at) with owner + public-read RLS

**Storage** (SQL in `supabase/storage-policies.sql`): bucket `media` (public), policies for owner insert/update/delete + public read. Paths: `{uid}/avatars/...` and `{uid}/links/...`.

**New files:**
- `src/lib/config/socials.ts` — 19 platforms with inline SVG paths
- `src/app/actions/links.ts` — addLink, updateLink, deleteLink, reorderLinks
- `src/app/actions/socials.ts` — addSocial, updateSocial, deleteSocial, reorderSocials (max 20 enforced)
- `src/components/public/social-icon.tsx` — renders brand SVG by platform id
- `src/components/public/age-gate.tsx` — client component, sessionStorage confirmation
- `src/components/public/profile-page-view.tsx` — shared renderer (used by public page + preview)
- `src/components/dashboard/page-builder/page-builder.tsx` — main shell (tabs, header, two-pane)
- `src/components/dashboard/page-builder/profile-tab.tsx` — avatar upload+crop, style, name, bio, active badge
- `src/components/dashboard/page-builder/links-tab.tsx` — dnd-kit list, add/edit/delete, icon picker, thumbnail, 18+
- `src/components/dashboard/page-builder/socials-tab.tsx` — dnd-kit list, platform picker
- `src/components/dashboard/page-builder/advanced-tab.tsx` — age gate toggle + Phase 5 stubs
- `src/components/dashboard/page-builder/live-preview.tsx` — phone frame preview
- `src/components/dashboard/page-builder/avatar-crop-modal.tsx` — react-easy-crop modal

**Modified:**
- `src/lib/supabase/types.ts` — AvatarStyle, updated Page/PageLink, new PageSocial, PageWithData
- `src/app/actions/pages.ts` — updatePage extended for avatar_url, avatar_style, active_badge, age_gate_enabled
- `src/app/(dashboard)/dashboard/links/[id]/page.tsx` — loads links+socials+plan, renders PageBuilder
- `src/app/[slug]/page.tsx` — uses ProfilePageView + AgeGate + footer with Report link

## What to do in Supabase before testing
1. Run `supabase/migrations/20260623_phase2b.sql` in SQL editor
2. Create bucket `media` (public) in Storage dashboard
3. Run `supabase/storage-policies.sql` in SQL editor

## Phase 2C queue
Design tab (button colors, fonts, corners, shadows, per-button gradients, page backgrounds, animations, 4 named presets).
