---
name: project-ultralink-phase2c
description: Phase 2C complete — Design Engine (Theme type, Design tab, 4 presets, full theme rendering on preview + public page)
metadata:
  type: project
---

Phase 2C done. Build passes clean.

**Why:** Adding a curated design engine so users can theme their page without breaking things.

**How to apply:** Next phase is 3 — Analytics (click tracking, dashboard charts). Do NOT start Phase 3 yet unless instructed.

## What was built

**New files:**
- `src/lib/config/theme.ts` — `Theme` type, `DEFAULT_THEME`, `PRESETS` (4 named presets), all curated option sets (BG colors/gradients, button swatches/gradients, corners, shadows, fonts, animations), helper functions (`resolveTheme`, `fontVar`, `cornerRadius`, `shadowValue`, `animClass`, `gradientEndColor`)
- `src/components/dashboard/page-builder/design-tab.tsx` — full Design tab UI (Presets → Page BG → Container BG → Buttons → Text → Animation), fully driven by curated config

**Modified:**
- `src/app/layout.tsx` — added 6 Google fonts: Poppins, Montserrat, Space Grotesk, DM Sans, Cormorant, Bebas Neue (Inter + Playfair already existed). Each has a CSS variable (`--font-poppins`, etc.)
- `src/app/globals.css` — added `@keyframes` + `.theme-anim-{bounce,shake,pulse}` hover classes with `prefers-reduced-motion` guard
- `src/app/actions/pages.ts` — `updatePage` now parses and saves `theme` JSON from formData into the `pages.theme` jsonb column
- `src/components/dashboard/page-builder/page-builder.tsx` — Design tab inserted between Profile and Links; `theme` state initialized via `resolveTheme(page.theme)`; JSON-stringified into a hidden `<input name="theme">` on save; passed to `LivePreview`
- `src/components/dashboard/page-builder/live-preview.tsx` — accepts and passes `theme` prop to `ProfilePageView`
- `src/components/public/profile-page-view.tsx` — full theme rendering: page bg (color/gradient/image+overlay), hero avatar fade into actual page bg color, container panel, page-wide button style (fill/corner/shadow/font/text-color), title+body colors+fonts, animation CSS classes
- `src/app/[slug]/page.tsx` — passes `typedPage.theme` to `ProfilePageView`

## Theme shape (persisted to pages.theme jsonb)
```ts
type Theme = {
  preset: 'max_conversion' | 'stack' | 'cover' | 'aesthetic' | 'custom';
  pageBg: { type: 'color'|'gradient'|'image'; value: string; overlay: number };
  containerBg: { type: 'none'|'color'|'gradient'; value: string };
  button: { fill: { type: 'color'|'gradient'; value: string }; textColor: string; corner: 'square'|'rounded'|'more'|'pill'; shadow: 'none'|'subtle'|'medium'; font: string };
  title: { color: string; font: string };
  text: { color: string };
  animation: 'none'|'bounce'|'shake'|'pulse';
};
```

## No SQL needed
Uses the existing `pages.theme` jsonb column — no migrations required.

## Phase 3 queue
Analytics: click tracking on link buttons, dashboard chart showing clicks over time per link/page.
