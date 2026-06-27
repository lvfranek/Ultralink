// ─── PAGE-LEVEL THEME ─────────────────────────────────────────────────────────

export type Theme = {
  preset: 'glacier' | 'sunset' | 'mint' | 'lilac' | 'custom';
  pageBg: { type: 'color' | 'gradient' | 'image'; value: string; overlay: number };
  fonts: { title: string; body: string };
  colors: {
    name: string;
    handle: string;
    icons: string;
  };
};

// ─── PER-LINK STYLE ───────────────────────────────────────────────────────────

export type LinkStyle = {
  fillType: 'color' | 'gradient';
  fillValue: string;
  textColor: string;
  corner: 'square' | 'rounded' | 'more' | 'pill';
  animation: 'none' | 'bounce' | 'shake' | 'pulse';
};

// ─── FONTS ────────────────────────────────────────────────────────────────────

export const FONT_OPTIONS = [
  { id: 'inter',         label: 'Inter',            variable: '--font-inter' },
  { id: 'playfair',      label: 'Playfair Display',  variable: '--font-playfair' },
  { id: 'poppins',       label: 'Poppins',           variable: '--font-poppins' },
  { id: 'montserrat',    label: 'Montserrat',        variable: '--font-montserrat' },
  { id: 'space-grotesk', label: 'Space Grotesk',     variable: '--font-space-grotesk' },
  { id: 'dm-sans',       label: 'DM Sans',           variable: '--font-dm-sans' },
  { id: 'cormorant',     label: 'Cormorant',         variable: '--font-cormorant' },
  { id: 'bebas',         label: 'Bebas Neue',        variable: '--font-bebas' },
] as const;

export type FontId = typeof FONT_OPTIONS[number]['id'];

export function fontVar(id: string): string {
  const f = FONT_OPTIONS.find((f) => f.id === id);
  return f ? `var(${f.variable}), system-ui, sans-serif` : 'var(--font-inter), system-ui, sans-serif';
}

// ─── BACKGROUND OPTIONS ───────────────────────────────────────────────────────

export const BG_COLORS = [
  { label: 'White',      value: '#FFFFFF' },
  { label: 'Void',       value: '#0A0A0B' },
  { label: 'Charcoal',   value: '#141417' },
  { label: 'Deep Navy',  value: '#0A0E1A' },
  { label: 'Blush',      value: '#FFF0F0' },
  { label: 'Mint',       value: '#F0FFF8' },
] as const;

// ─── BUTTON / LINK CORNER OPTIONS ────────────────────────────────────────────

export const BUTTON_CORNERS = [
  { id: 'square'  as const, label: 'Square',  radius: '0px' },
  { id: 'rounded' as const, label: 'Rounded', radius: '0.5rem' },
  { id: 'more'    as const, label: 'More',    radius: '1rem' },
  { id: 'pill'    as const, label: 'Pill',    radius: '9999px' },
];

export const ANIMATIONS = [
  { id: 'none'   as const, label: 'None' },
  { id: 'bounce' as const, label: 'Bounce' },
  { id: 'shake'  as const, label: 'Shake' },
  { id: 'pulse'  as const, label: 'Pulse' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function cornerRadius(corner: LinkStyle['corner']): string {
  return BUTTON_CORNERS.find((c) => c.id === corner)?.radius ?? '0.5rem';
}

export function animClass(anim: LinkStyle['animation']): string {
  return anim === 'none' ? '' : `theme-anim-${anim}`;
}

/** Extract the terminal color from a CSS gradient string (best-effort). */
export function gradientEndColor(gradientValue: string): string {
  const matches = gradientValue.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g);
  if (matches && matches.length > 0) return matches[matches.length - 1];
  return '#0A0A0B';
}

// ─── DEFAULT LINK STYLE ───────────────────────────────────────────────────────

export const DEFAULT_LINK_STYLE: LinkStyle = {
  fillType: 'color',
  fillValue: '#06AEEF',
  textColor: '#FFFFFF',
  corner: 'pill',
  animation: 'none',
};

// ─── DEFAULT THEME ────────────────────────────────────────────────────────────

export const DEFAULT_THEME: Theme = {
  preset: 'glacier',
  pageBg: { type: 'color', value: '#FFFFFF', overlay: 0 },
  fonts: { title: 'inter', body: 'inter' },
  colors: { name: '#0A0A0A', handle: '#5A5A5A', icons: '#0A0A0A' },
};

// ─── PRESETS ──────────────────────────────────────────────────────────────────

export type PresetKey = Exclude<Theme['preset'], 'custom'>;

export type PresetDef = {
  theme: Theme;
  linkStyle: LinkStyle;
};

export const PRESETS: Record<PresetKey, PresetDef> = {
  glacier: {
    theme: {
      preset: 'glacier',
      pageBg: { type: 'color', value: '#FFFFFF', overlay: 0 },
      fonts: { title: 'inter', body: 'inter' },
      colors: { name: '#0A0A0A', handle: '#5A5A5A', icons: '#0A0A0A' },
    },
    linkStyle: { fillType: 'color', fillValue: '#06AEEF', textColor: '#FFFFFF', corner: 'pill', animation: 'none' },
  },
  sunset: {
    theme: {
      preset: 'sunset',
      pageBg: { type: 'color', value: '#FFFFFF', overlay: 0 },
      fonts: { title: 'inter', body: 'inter' },
      colors: { name: '#0A0A0A', handle: '#5A5A5A', icons: '#0A0A0A' },
    },
    linkStyle: { fillType: 'color', fillValue: '#FF5A4E', textColor: '#FFFFFF', corner: 'rounded', animation: 'none' },
  },
  mint: {
    theme: {
      preset: 'mint',
      pageBg: { type: 'color', value: '#FFFFFF', overlay: 0 },
      fonts: { title: 'inter', body: 'inter' },
      colors: { name: '#0A0A0A', handle: '#5A5A5A', icons: '#0A0A0A' },
    },
    linkStyle: { fillType: 'color', fillValue: '#34C28B', textColor: '#FFFFFF', corner: 'rounded', animation: 'none' },
  },
  lilac: {
    theme: {
      preset: 'lilac',
      pageBg: { type: 'color', value: '#FFFFFF', overlay: 0 },
      fonts: { title: 'inter', body: 'inter' },
      colors: { name: '#0A0A0A', handle: '#5A5A5A', icons: '#0A0A0A' },
    },
    linkStyle: { fillType: 'color', fillValue: '#A78BFA', textColor: '#FFFFFF', corner: 'rounded', animation: 'none' },
  },
};

export const PRESET_META: Record<PresetKey, { label: string }> = {
  glacier: { label: 'Glacier' },
  sunset:  { label: 'Sunset' },
  mint:    { label: 'Mint' },
  lilac:   { label: 'Lilac' },
};

// ─── LINK STYLE RESOLVER ──────────────────────────────────────────────────────

/** Map DB row fields to LinkStyle (handles missing/defaulted columns). */
export function resolveLinkStyle(row: {
  fill_type?: string | null;
  fill_value?: string | null;
  text_color?: string | null;
  corner?: string | null;
  animation?: string | null;
}): LinkStyle {
  return {
    fillType: (row.fill_type as LinkStyle['fillType']) ?? DEFAULT_LINK_STYLE.fillType,
    fillValue: row.fill_value ?? DEFAULT_LINK_STYLE.fillValue,
    textColor: row.text_color ?? DEFAULT_LINK_STYLE.textColor,
    corner: (row.corner as LinkStyle['corner']) ?? DEFAULT_LINK_STYLE.corner,
    animation: (row.animation as LinkStyle['animation']) ?? DEFAULT_LINK_STYLE.animation,
  };
}

// ─── SAFE THEME MERGE ─────────────────────────────────────────────────────────

/** Merge raw DB value with DEFAULT_THEME; silently drops removed fields (button/title/text/animation/containerBg). */
export function resolveTheme(raw: Record<string, unknown> | null | undefined): Theme {
  if (!raw || typeof raw !== 'object' || Object.keys(raw).length === 0) return DEFAULT_THEME;

  const r = raw as Record<string, unknown>;
  const pageBgRaw = (r.pageBg ?? {}) as Record<string, unknown>;
  const fontsRaw = (r.fonts ?? {}) as Record<string, unknown>;
  const colorsRaw = (r.colors ?? {}) as Record<string, unknown>;

  const validPresets: PresetKey[] = ['glacier', 'sunset', 'mint', 'lilac'];
  const rawPreset = r.preset as string;
  const preset: Theme['preset'] =
    rawPreset === 'custom'
      ? 'custom'
      : validPresets.includes(rawPreset as PresetKey)
      ? (rawPreset as PresetKey)
      : DEFAULT_THEME.preset;

  return {
    preset,
    pageBg: {
      type: (pageBgRaw.type as Theme['pageBg']['type']) ?? DEFAULT_THEME.pageBg.type,
      value: (pageBgRaw.value as string) ?? DEFAULT_THEME.pageBg.value,
      overlay: typeof pageBgRaw.overlay === 'number' ? pageBgRaw.overlay : DEFAULT_THEME.pageBg.overlay,
    },
    fonts: {
      title: (fontsRaw.title as string) ?? DEFAULT_THEME.fonts.title,
      body:  (fontsRaw.body  as string) ?? DEFAULT_THEME.fonts.body,
    },
    colors: {
      name:   (colorsRaw.name   as string) ?? DEFAULT_THEME.colors.name,
      handle: (colorsRaw.handle as string) ?? DEFAULT_THEME.colors.handle,
      icons:  (colorsRaw.icons  as string) ?? DEFAULT_THEME.colors.icons,
    },
  };
}
