export type Theme = {
  preset: 'max_conversion' | 'stack' | 'cover' | 'aesthetic' | 'custom';
  pageBg: { type: 'color' | 'gradient' | 'image'; value: string; overlay: number };
  button: {
    fill: { type: 'color' | 'gradient'; value: string };
    textColor: string;
    corner: 'square' | 'rounded' | 'more' | 'pill';
    shadow: 'none' | 'subtle' | 'medium';
    font: string;
  };
  title: { color: string; font: string };
  text: { color: string };
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
  { label: 'Void',      value: '#0A0A0B' },
  { label: 'Charcoal',  value: '#141417' },
  { label: 'Deep Wine', value: '#1A0A0E' },
  { label: 'Deep Navy', value: '#0A0E1A' },
  { label: 'Espresso',  value: '#0F0B07' },
  { label: 'Ink',       value: '#080A10' },
] as const;

export const BG_GRADIENTS = [
  { label: 'Black Gold', value: 'linear-gradient(135deg, #0A0A0B 0%, #1A1208 50%, #0A0A0B 100%)' },
  { label: 'Midnight',   value: 'linear-gradient(180deg, #0A0E1A 0%, #0A0A0B 100%)' },
  { label: 'Obsidian',   value: 'linear-gradient(135deg, #141417 0%, #0A0A0B 100%)' },
  { label: 'Dark Wine',  value: 'linear-gradient(135deg, #1A0A0E 0%, #0A0A0B 100%)' },
  { label: 'Noir',       value: 'linear-gradient(180deg, #080A10 0%, #0A0A0B 100%)' },
  { label: 'Dusk',       value: 'linear-gradient(135deg, #0D0A1A 0%, #0A0A0B 50%, #1A0A0A 100%)' },
] as const;

// ─── BUTTON OPTIONS ───────────────────────────────────────────────────────────

export const BUTTON_COLOR_SWATCHES = [
  { label: 'Gold',       value: '#C9A86A' },
  { label: 'Bright Gold',value: '#E6C878' },
  { label: 'White',      value: '#F5F3EF' },
  { label: 'Off-white',  value: '#E8E6E2' },
  { label: 'Black',      value: '#0A0A0B' },
  { label: 'Surface',    value: '#1C1C20' },
  { label: 'Slate',      value: '#374151' },
  { label: 'Wine',       value: '#881337' },
] as const;

export const BUTTON_GRADIENT_SWATCHES = [
  { label: 'Gold',    value: 'linear-gradient(135deg, #C9A86A 0%, #E6C878 100%)' },
  { label: 'Silver',  value: 'linear-gradient(135deg, #8E9BAB 0%, #C0CAD4 100%)' },
  { label: 'Dark',    value: 'linear-gradient(135deg, #1C1C20 0%, #2A2A30 100%)' },
  { label: 'Wine',    value: 'linear-gradient(135deg, #881337 0%, #BE123C 100%)' },
  { label: 'Ocean',   value: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)' },
  { label: 'Smoke',   value: 'linear-gradient(135deg, #374151 0%, #6B7280 100%)' },
] as const;

export const BUTTON_CORNERS = [
  { id: 'square'  as const, label: 'Square',  radius: '0px' },
  { id: 'rounded' as const, label: 'Rounded', radius: '0.5rem' },
  { id: 'more'    as const, label: 'More',    radius: '1rem' },
  { id: 'pill'    as const, label: 'Pill',    radius: '9999px' },
];

export const BUTTON_SHADOWS = [
  { id: 'none'   as const, label: 'None',   value: 'none' },
  { id: 'subtle' as const, label: 'Subtle', value: '0 1px 4px rgba(0,0,0,0.40)' },
  { id: 'medium' as const, label: 'Medium', value: '0 4px 16px rgba(0,0,0,0.55)' },
];

// ─── TEXT COLOR SWATCHES ──────────────────────────────────────────────────────

export const TEXT_COLOR_SWATCHES = [
  { label: 'Snow',       value: '#F5F3EF' },
  { label: 'Off-white',  value: '#E8E6E2' },
  { label: 'Muted',      value: '#9A9AA2' },
  { label: 'Gold',       value: '#C9A86A' },
  { label: 'Bright Gold',value: '#E6C878' },
  { label: 'Black',      value: '#0A0A0B' },
] as const;

// ─── ANIMATION ────────────────────────────────────────────────────────────────

export const ANIMATIONS = [
  { id: 'none'   as const, label: 'None' },
  { id: 'bounce' as const, label: 'Bounce' },
  { id: 'shake'  as const, label: 'Shake' },
  { id: 'pulse'  as const, label: 'Pulse' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function cornerRadius(corner: Theme['button']['corner']): string {
  return BUTTON_CORNERS.find((c) => c.id === corner)?.radius ?? '0.5rem';
}

export function shadowValue(shadow: Theme['button']['shadow']): string {
  return BUTTON_SHADOWS.find((s) => s.id === shadow)?.value ?? 'none';
}

export function animClass(anim: Theme['animation']): string {
  return anim === 'none' ? '' : `theme-anim-${anim}`;
}

/** Extract the terminal color from a CSS gradient string (best-effort). */
export function gradientEndColor(gradientValue: string): string {
  const matches = gradientValue.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g);
  if (matches && matches.length > 0) return matches[matches.length - 1];
  return '#0A0A0B';
}

/** Resolve the CSS `background` value for a pageBg entry. */
export function pageBgStyle(pageBg: Theme['pageBg']): string {
  if (pageBg.type === 'color') return pageBg.value;
  if (pageBg.type === 'gradient') return pageBg.value;
  // image — the component wraps it in a container with overlay, handled in JSX
  return '#0A0A0B';
}

// ─── DEFAULT THEME ────────────────────────────────────────────────────────────

export const DEFAULT_THEME: Theme = {
  preset: 'stack',
  pageBg: { type: 'color', value: '#0A0A0B', overlay: 0 },
  button: {
    fill: { type: 'color', value: '#1C1C20' },
    textColor: '#F5F3EF',
    corner: 'rounded',
    shadow: 'subtle',
    font: 'inter',
  },
  title: { color: '#F5F3EF', font: 'inter' },
  text: { color: '#9A9AA2' },
  animation: 'none',
};

// ─── PRESETS ──────────────────────────────────────────────────────────────────

export const PRESETS: Record<Exclude<Theme['preset'], 'custom'>, Theme> = {
  max_conversion: {
    preset: 'max_conversion',
    pageBg: { type: 'color', value: '#0A0A0B', overlay: 0 },
    button: {
      fill: { type: 'color', value: '#E6C878' },
      textColor: '#0A0A0B',
      corner: 'pill',
      shadow: 'none',
      font: 'inter',
    },
    title: { color: '#F5F3EF', font: 'inter' },
    text: { color: '#9A9AA2' },
    animation: 'none',
  },
  stack: {
    preset: 'stack',
    pageBg: { type: 'color', value: '#0A0A0B', overlay: 0 },
    button: {
      fill: { type: 'color', value: '#1C1C20' },
      textColor: '#F5F3EF',
      corner: 'rounded',
      shadow: 'subtle',
      font: 'inter',
    },
    title: { color: '#F5F3EF', font: 'inter' },
    text: { color: '#9A9AA2' },
    animation: 'none',
  },
  cover: {
    preset: 'cover',
    pageBg: { type: 'color', value: '#111827', overlay: 0 },
    button: {
      fill: { type: 'color', value: 'rgba(255,255,255,0.08)' },
      textColor: '#F5F3EF',
      corner: 'rounded',
      shadow: 'subtle',
      font: 'inter',
    },
    title: { color: '#F5F3EF', font: 'inter' },
    text: { color: '#9A9AA2' },
    animation: 'none',
  },
  aesthetic: {
    preset: 'aesthetic',
    pageBg: { type: 'gradient', value: 'linear-gradient(135deg, #0A0A0B 0%, #1A1208 50%, #0A0A0B 100%)', overlay: 0 },
    button: {
      fill: { type: 'gradient', value: 'linear-gradient(135deg, #C9A86A 0%, #E6C878 100%)' },
      textColor: '#0A0A0B',
      corner: 'more',
      shadow: 'medium',
      font: 'playfair',
    },
    title: { color: '#E6C878', font: 'playfair' },
    text: { color: '#9A9AA2' },
    animation: 'none',
  },
};

// ─── PRESET DESCRIPTIONS ──────────────────────────────────────────────────────

export const PRESET_META: Record<Exclude<Theme['preset'], 'custom'>, { label: string; description: string }> = {
  max_conversion: { label: 'Max Conversion', description: 'Minimal · High-contrast · Drives a single tap' },
  stack:          { label: 'Stack',           description: 'Classic · Clean · Highly readable' },
  cover:          { label: 'Cover',           description: 'Image-forward · Soft container panel' },
  aesthetic:      { label: 'Aesthetic',       description: 'Editorial luxury · Antique gold · Premium' },
};

// ─── SAFE MERGE ───────────────────────────────────────────────────────────────

/** Merge raw DB value (possibly partial or empty) with DEFAULT_THEME, crash-safe. */
export function resolveTheme(raw: Record<string, unknown> | null | undefined): Theme {
  if (!raw || typeof raw !== 'object' || Object.keys(raw).length === 0) return DEFAULT_THEME;

  const r = raw as Record<string, unknown>;
  const pageBgRaw = (r.pageBg ?? {}) as Record<string, unknown>;
  const buttonRaw = (r.button ?? {}) as Record<string, unknown>;
  const fillRaw = (buttonRaw.fill ?? {}) as Record<string, unknown>;
  const titleRaw = (r.title ?? {}) as Record<string, unknown>;
  const textRaw = (r.text ?? {}) as Record<string, unknown>;

  return {
    preset: (r.preset as Theme['preset']) ?? DEFAULT_THEME.preset,
    pageBg: {
      type: (pageBgRaw.type as Theme['pageBg']['type']) ?? DEFAULT_THEME.pageBg.type,
      value: (pageBgRaw.value as string) ?? DEFAULT_THEME.pageBg.value,
      overlay: typeof pageBgRaw.overlay === 'number' ? pageBgRaw.overlay : DEFAULT_THEME.pageBg.overlay,
    },
    button: {
      fill: {
        type: (fillRaw.type as Theme['button']['fill']['type']) ?? DEFAULT_THEME.button.fill.type,
        value: (fillRaw.value as string) ?? DEFAULT_THEME.button.fill.value,
      },
      textColor: (buttonRaw.textColor as string) ?? DEFAULT_THEME.button.textColor,
      corner: (buttonRaw.corner as Theme['button']['corner']) ?? DEFAULT_THEME.button.corner,
      shadow: (buttonRaw.shadow as Theme['button']['shadow']) ?? DEFAULT_THEME.button.shadow,
      font: (buttonRaw.font as string) ?? DEFAULT_THEME.button.font,
    },
    title: {
      color: (titleRaw.color as string) ?? DEFAULT_THEME.title.color,
      font: (titleRaw.font as string) ?? DEFAULT_THEME.title.font,
    },
    text: {
      color: (textRaw.color as string) ?? DEFAULT_THEME.text.color,
    },
    animation: (r.animation as Theme['animation']) ?? DEFAULT_THEME.animation,
  };
}
