"use client";

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";
import { createClient } from "@/lib/supabase/client";
import {
  type Theme,
  type PresetKey,
  type LinkStyle,
  PRESETS,
  PRESET_META,
  FONT_OPTIONS,
  BUTTON_CORNERS,
  ANIMATIONS,
  cornerRadius,
} from "@/lib/config/theme";
import { FieldRow } from "./panel-primitives";
import type { PageLink } from "@/lib/supabase/types";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function patchTheme(theme: Theme, partial: Partial<Theme>): Theme {
  return { ...theme, ...partial, preset: "custom" as const };
}

// ─── SHARED PRIMITIVES ────────────────────────────────────────────────────────

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex p-1 ${className ?? "w-full"}`}
      style={{
        background: "#1A1A1A",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 9999,
      }}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className="flex-1 px-3 py-1 text-xs font-medium transition-all duration-150 cursor-pointer"
          style={{
            borderRadius: 9999,
            background: value === o.id ? "#ffffff" : "transparent",
            color: value === o.id ? "#000000" : "#9A9A9A",
          }}
          onMouseEnter={(e) => {
            if (value !== o.id) e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            if (value !== o.id) e.currentTarget.style.color = "#9A9A9A";
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── COLOR PICKER FIELD ───────────────────────────────────────────────────────

export function ColorPickerField({
  label,
  value,
  onChange,
  inline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inline?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverH = 290;
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < popoverH + 8) {
      setPopoverStyle({
        position: "fixed",
        bottom: window.innerHeight - rect.top + 4,
        right: window.innerWidth - rect.right,
        zIndex: 9999,
      });
    } else {
      setPopoverStyle({
        position: "fixed",
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
        zIndex: 9999,
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  const pickerContent = (
    <>
      {/* Click-outside overlay */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9998 }}
        onClick={() => setOpen(false)}
      />
      {/* Picker popover — hardcoded dark bg; the page-builder editor stays dark
          even though --color-surface resolves to the light dashboard-chrome token */}
      <div
        style={{
          ...popoverStyle,
          background: "#1A1A1A",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: "var(--radius, 0.75rem)",
          padding: "0.75rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        <HexColorPicker color={value} onChange={onChange} />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v.length === 7 ? v : value);
          }}
          className="mt-2 w-full font-mono text-xs rounded px-2 py-1.5 focus:outline-none uppercase"
          style={{
            background: "#1A1A1A",
            border: "1px solid rgba(255,255,255,.1)",
            color: "#FFFFFF",
          }}
          maxLength={7}
          spellCheck={false}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </>
  );

  return (
    <div className="relative">
      {!inline && <p className="text-xs font-medium text-text-muted mb-2">{label}</p>}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-strong rounded-[var(--radius-sm)] cursor-pointer hover:border-gold/40 transition-colors"
      >
        <span
          className="w-4 h-4 rounded-sm flex-shrink-0 border border-black/10"
          style={{ background: value }}
        />
        <span className="text-xs text-text font-mono uppercase">{value}</span>
      </button>
      {open && mounted && createPortal(pickerContent, document.body)}
    </div>
  );
}

// ─── GRADIENT BUILDER ─────────────────────────────────────────────────────────

const GRADIENT_DIRECTIONS = [
  { angle: 0,   label: "↑" },
  { angle: 45,  label: "↗" },
  { angle: 90,  label: "→" },
  { angle: 135, label: "↘" },
];

function parseGradient(css: string): { stop1: string; stop2: string; angle: number } {
  const angleMatch = css.match(/(\d+)deg/);
  const angle = angleMatch ? parseInt(angleMatch[1]) : 135;
  const colors = css.match(/#[0-9a-fA-F]{3,8}/g) ?? ["#06AEEF", "#A78BFA"];
  return { stop1: colors[0] ?? "#06AEEF", stop2: colors[1] ?? "#A78BFA", angle };
}

function buildGradient(stop1: string, stop2: string, angle: number): string {
  return `linear-gradient(${angle}deg, ${stop1} 0%, ${stop2} 100%)`;
}

export function GradientBuilder({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = parseGradient(value);
  const [stop1, setStop1] = useState(parsed.stop1);
  const [stop2, setStop2] = useState(parsed.stop2);
  const [angle, setAngle] = useState(parsed.angle);

  function update(s1: string, s2: string, a: number) {
    setStop1(s1);
    setStop2(s2);
    setAngle(a);
    onChange(buildGradient(s1, s2, a));
  }

  const angleOptions = GRADIENT_DIRECTIONS.map((d) => ({ id: String(d.angle) as string, label: d.label }));

  return (
    <div className="space-y-3">
      <div
        className="w-full h-7 rounded-[var(--radius-sm)] border border-border-strong"
        style={{ background: buildGradient(stop1, stop2, angle) }}
      />
      <div className="grid grid-cols-2 gap-3">
        <ColorPickerField label="Start" value={stop1} onChange={(v) => update(v, stop2, angle)} />
        <ColorPickerField label="End" value={stop2} onChange={(v) => update(stop1, v, angle)} />
      </div>
      {/* Direction — pill segmented */}
      <div
        className="flex p-1 w-full"
        style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)", borderRadius: 9999 }}
      >
        {GRADIENT_DIRECTIONS.map((d) => (
          <button
            key={d.angle}
            type="button"
            onClick={() => update(stop1, stop2, d.angle)}
            className="flex-1 py-1 text-sm font-medium transition-all duration-150 cursor-pointer"
            style={{
              borderRadius: 9999,
              background: angle === d.angle ? "#ffffff" : "transparent",
              color: angle === d.angle ? "#000000" : "#9A9A9A",
            }}
            onMouseEnter={(e) => { if (angle !== d.angle) e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={(e) => { if (angle !== d.angle) e.currentTarget.style.color = "#9A9A9A"; }}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PRESET THUMBNAIL ─────────────────────────────────────────────────────────

function PresetThumb({ presetKey, active }: { presetKey: PresetKey; active: boolean }) {
  const preset = PRESETS[presetKey];
  const bg = preset.theme.pageBg.type !== "image" ? preset.theme.pageBg.value : "#FFFFFF";
  const btnBg = preset.linkStyle.fillValue;
  const btnRadius = cornerRadius(preset.linkStyle.corner);
  const nameColor = preset.theme.colors.name;

  return (
    <div
      className={[
        "relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer w-full",
        active ? "border-gold shadow-[0_0_0_2px_rgba(201,168,106,0.25)]" : "border-border-strong hover:border-gold/40",
      ].join(" ")}
      style={{ height: 90, background: bg }}
    >
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black/10 border border-black/10" />
      <div className="absolute top-7 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full" style={{ background: nameColor, opacity: 0.8 }} />
      <div className="absolute bottom-2 left-2 right-2 space-y-1">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="w-full h-2"
            style={{ background: btnBg, borderRadius: btnRadius, opacity: i === 1 ? 1 : 0.5 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── CONTENT SECTIONS (used inside SettingsCards in page-builder) ─────────────

interface ThemeProps {
  theme: Theme;
  userId: string;
  links: PageLink[];
  onChange: (theme: Theme) => void;
  onPresetApply: (key: PresetKey, linkStyle: LinkStyle) => void;
}

/** Has the user diverged from the currently active preset's own defaults? */
function hasCustomWork(theme: Theme, links: PageLink[]): boolean {
  if (theme.preset === "custom") return true;
  const activeStyle = PRESETS[theme.preset].linkStyle;
  return links.some(
    (l) =>
      l.fill_type !== activeStyle.fillType ||
      l.fill_value !== activeStyle.fillValue ||
      l.text_color !== activeStyle.textColor ||
      l.corner !== activeStyle.corner ||
      l.animation !== activeStyle.animation
  );
}

export function PresetsContent({ theme, userId, links, onChange, onPresetApply }: ThemeProps) {
  const [bgUploading, setBgUploading] = useState(false);
  const [bgUploadError, setBgUploadError] = useState<string | null>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const [pendingPreset, setPendingPreset] = useState<PresetKey | null>(null);

  function applyPreset(key: PresetKey) {
    const preset = PRESETS[key];
    onChange(preset.theme);
    onPresetApply(key, preset.linkStyle);
  }

  function handlePresetClick(key: PresetKey) {
    if (theme.preset === key) return;
    if (hasCustomWork(theme, links)) {
      setPendingPreset(key);
    } else {
      applyPreset(key);
    }
  }

  function confirmPendingPreset() {
    if (pendingPreset) applyPreset(pendingPreset);
    setPendingPreset(null);
  }

  function setPageBgType(type: Theme["pageBg"]["type"]) {
    const defaults: Record<Theme["pageBg"]["type"], { value: string; overlay: number }> = {
      color:    { value: "#FFFFFF", overlay: 0 },
      gradient: { value: "linear-gradient(135deg, #06AEEF 0%, #A78BFA 100%)", overlay: 0 },
      image:    { value: theme.pageBg.type === "image" ? theme.pageBg.value : "", overlay: 0.4 },
    };
    onChange(patchTheme(theme, { pageBg: { type, ...defaults[type] } }));
  }

  async function handleBgImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setBgUploadError("JPEG, PNG, or WebP only."); return; }
    if (file.size > 8 * 1024 * 1024) { setBgUploadError("Image must be under 8 MB."); return; }

    setBgUploadError(null);
    setBgUploading(true);
    try {
      const supabase = createClient();
      const filename = `${userId}/backgrounds/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("media").upload(filename, file, { contentType: file.type, upsert: true });
      if (error) { setBgUploadError(error.message); return; }
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(filename);
      onChange(patchTheme(theme, { pageBg: { type: "image", value: publicUrl, overlay: theme.pageBg.overlay > 0 ? theme.pageBg.overlay : 0.4 } }));
    } finally {
      setBgUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* 2×2 preset grid — compact */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handlePresetClick(key)}
            className="flex flex-col gap-1 cursor-pointer group text-left"
          >
            <PresetThumb presetKey={key} active={theme.preset === key} />
            <p className={`text-[11px] font-medium ${theme.preset === key ? "text-gold" : "text-text-muted group-hover:text-text"} transition-colors`}>
              {PRESET_META[key].label}
            </p>
          </button>
        ))}
      </div>

      {/* Page background */}
      <div className="pt-1" style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <p className="text-xs text-text-subtle mb-2 pt-3">Background</p>
        <SegmentedControl
          options={[
            { id: "color" as const,    label: "Color" },
            { id: "gradient" as const, label: "Gradient" },
            { id: "image" as const,    label: "Image" },
          ]}
          value={theme.pageBg.type}
          onChange={setPageBgType}
        />
        <div className="mt-3">
          {theme.pageBg.type === "color" && (
            <ColorPickerField
              label="Background color"
              value={theme.pageBg.value}
              onChange={(v) => onChange(patchTheme(theme, { pageBg: { ...theme.pageBg, type: "color", value: v } }))}
            />
          )}
          {theme.pageBg.type === "gradient" && (
            <GradientBuilder
              value={theme.pageBg.value}
              onChange={(v) => onChange(patchTheme(theme, { pageBg: { ...theme.pageBg, type: "gradient", value: v } }))}
            />
          )}
          {theme.pageBg.type === "image" && (
            <div className="space-y-3">
              <input
                ref={bgFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleBgImageUpload}
              />
              <div className="flex items-center gap-3">
                {theme.pageBg.value && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={theme.pageBg.value}
                    alt="Background"
                    className="w-12 h-12 rounded-[var(--radius-sm)] object-cover border border-border-strong flex-shrink-0"
                  />
                )}
                <button
                  type="button"
                  disabled={bgUploading}
                  onClick={() => bgFileRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium border border-border-strong text-text rounded-[var(--radius-sm)] hover:bg-surface-2 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {bgUploading ? "Uploading…" : theme.pageBg.value ? "Change image" : "Upload image"}
                </button>
              </div>
              {bgUploadError && <p className="text-xs text-red-400">{bgUploadError}</p>}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-text-muted">Visibility</p>
                  <span className="text-xs text-text-subtle">{Math.round(theme.pageBg.overlay * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.7}
                  step={0.05}
                  value={theme.pageBg.overlay}
                  onChange={(e) => onChange(patchTheme(theme, { pageBg: { ...theme.pageBg, overlay: parseFloat(e.target.value) } }))}
                  className="w-full accent-gold h-1.5 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-text-muted">Blur</p>
                  <span className="text-xs text-text-subtle">{theme.pageBg.blur ?? 0}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={1}
                  value={theme.pageBg.blur ?? 0}
                  onChange={(e) => onChange(patchTheme(theme, { pageBg: { ...theme.pageBg, blur: parseInt(e.target.value, 10) } }))}
                  className="w-full accent-gold h-1.5 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {pendingPreset && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setPendingPreset(null); }}
        >
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.12)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-base font-semibold mb-2" style={{ color: "#ffffff" }}>
                Apply {PRESET_META[pendingPreset].label} theme?
              </h2>
              <p className="text-sm mb-5" style={{ color: "#9A9A9A" }}>
                This will replace your current colors, fonts, and button styling. Custom changes will be lost.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPendingPreset(null)}
                  className="flex-1 py-2 text-xs font-medium border rounded-full transition-colors cursor-pointer"
                  style={{ color: "#9A9A9A", borderColor: "rgba(255,255,255,.12)" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmPendingPreset}
                  className="flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer"
                  style={{ background: "#ffffff", color: "#000000" }}
                >
                  Apply {PRESET_META[pendingPreset].label}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TypographyProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export function TypographyContent({ theme, onChange }: TypographyProps) {
  const titleFont = FONT_OPTIONS.find((f) => f.id === theme.fonts.title);
  const bodyFont  = FONT_OPTIONS.find((f) => f.id === theme.fonts.body);

  return (
    <div>
      <FieldRow label="Title">
        <div className="relative inline-flex items-center w-full">
          <select
            value={theme.fonts.title}
            onChange={(e) => onChange(patchTheme(theme, { fonts: { ...theme.fonts, title: e.target.value } }))}
            className="w-full appearance-none bg-surface-2 border border-border-strong text-text rounded-[var(--radius-sm)] pl-2.5 pr-7 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 cursor-pointer"
            style={{ fontFamily: titleFont ? `var(${titleFont.variable}), system-ui, sans-serif` : undefined }}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2 w-3.5 h-3.5 text-text-muted shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </FieldRow>
      <FieldRow label="Body">
        <div className="relative inline-flex items-center w-full">
          <select
            value={theme.fonts.body}
            onChange={(e) => onChange(patchTheme(theme, { fonts: { ...theme.fonts, body: e.target.value } }))}
            className="w-full appearance-none bg-surface-2 border border-border-strong text-text rounded-[var(--radius-sm)] pl-2.5 pr-7 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 cursor-pointer"
            style={{ fontFamily: bodyFont ? `var(${bodyFont.variable}), system-ui, sans-serif` : undefined }}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2 w-3.5 h-3.5 text-text-muted shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </FieldRow>
    </div>
  );
}

interface ColorsProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export function ColorsContent({ theme, onChange }: ColorsProps) {
  return (
    <div>
      <FieldRow label="Name">
        <ColorPickerField
          label="Name color"
          value={theme.colors.name}
          onChange={(v) => onChange(patchTheme(theme, { colors: { ...theme.colors, name: v } }))}
          inline
        />
      </FieldRow>
      <FieldRow label="@handle">
        <ColorPickerField
          label="Handle color"
          value={theme.colors.handle}
          onChange={(v) => onChange(patchTheme(theme, { colors: { ...theme.colors, handle: v } }))}
          inline
        />
      </FieldRow>
    </div>
  );
}

// ─── RE-EXPORT helpers used in links-tab ─────────────────────────────────────
export { BUTTON_CORNERS, ANIMATIONS };
