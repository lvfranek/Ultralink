"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type Theme,
  PRESETS,
  PRESET_META,
  FONT_OPTIONS,
  BG_COLORS,
  BG_GRADIENTS,
  BUTTON_COLOR_SWATCHES,
  BUTTON_GRADIENT_SWATCHES,
  BUTTON_CORNERS,
  BUTTON_SHADOWS,
  TEXT_COLOR_SWATCHES,
  ANIMATIONS,
  cornerRadius,
  shadowValue,
} from "@/lib/config/theme";

interface DesignTabProps {
  theme: Theme;
  userId: string;
  onChange: (theme: Theme) => void;
}

// ─── SMALL SHARED PRIMITIVES ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-text-subtle uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-text-muted mb-2">{children}</p>
  );
}

function Divider() {
  return <div className="border-t border-border my-6" />;
}

/** A row of coloured swatches with an optional "custom" colour picker. */
function ColorSwatches({
  swatches,
  selected,
  onSelect,
  withCustom = false,
}: {
  swatches: readonly { label: string; value: string }[];
  selected: string;
  onSelect: (v: string) => void;
  withCustom?: boolean;
}) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const isCustom = withCustom && !swatches.some((s) => s.value === selected);

  return (
    <div className="flex flex-wrap gap-2">
      {swatches.map((s) => (
        <button
          key={s.value}
          type="button"
          title={s.label}
          onClick={() => onSelect(s.value)}
          className={[
            "w-7 h-7 rounded-full border-2 transition-all cursor-pointer flex-shrink-0",
            selected === s.value
              ? "border-gold scale-110 shadow-[0_0_0_2px_rgba(201,168,106,0.35)]"
              : "border-transparent hover:border-border-strong",
          ].join(" ")}
          style={{ background: s.value }}
          aria-label={s.label}
          aria-pressed={selected === s.value}
        />
      ))}
      {withCustom && (
        <>
          <button
            type="button"
            title="Custom colour"
            onClick={() => pickerRef.current?.click()}
            className={[
              "w-7 h-7 rounded-full border-2 transition-all cursor-pointer flex-shrink-0 flex items-center justify-center",
              isCustom
                ? "border-gold scale-110 shadow-[0_0_0_2px_rgba(201,168,106,0.35)]"
                : "border-border-strong bg-surface-2 hover:border-gold/40",
            ].join(" ")}
            style={isCustom ? { background: selected } : undefined}
            aria-label="Custom colour"
          >
            {!isCustom && (
              <svg viewBox="0 0 14 14" className="w-3 h-3 text-text-subtle" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 1v12M1 7h12" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <input
            ref={pickerRef}
            type="color"
            value={isCustom ? selected : "#C9A86A"}
            onChange={(e) => onSelect(e.target.value)}
            className="sr-only"
            aria-hidden="true"
          />
        </>
      )}
    </div>
  );
}

/** A row of gradient swatches (no custom picker — keep it curated). */
function GradientSwatches({
  swatches,
  selected,
  onSelect,
}: {
  swatches: readonly { label: string; value: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {swatches.map((s) => (
        <button
          key={s.value}
          type="button"
          title={s.label}
          onClick={() => onSelect(s.value)}
          className={[
            "h-8 rounded-[var(--radius-sm)] border-2 transition-all cursor-pointer text-[10px] font-medium text-white/70",
            selected === s.value
              ? "border-gold shadow-[0_0_0_2px_rgba(201,168,106,0.35)] scale-[1.03]"
              : "border-transparent hover:border-border-strong",
          ].join(" ")}
          style={{ background: s.value }}
          aria-label={s.label}
          aria-pressed={selected === s.value}
        />
      ))}
    </div>
  );
}

/** Segmented control for 2-3 short options. */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 p-1 bg-surface rounded-[var(--radius-sm)] border border-border">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={[
            "flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer",
            value === o.id
              ? "bg-surface-2 text-text border border-border-strong"
              : "text-text-muted hover:text-text",
          ].join(" ")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── PRESET MINI-THUMBNAIL ────────────────────────────────────────────────────

function PresetThumb({ presetKey, active }: { presetKey: Exclude<Theme['preset'], 'custom'>; active: boolean }) {
  const t = PRESETS[presetKey];
  const btnRadius = cornerRadius(t.button.corner);
  const btnShadow = shadowValue(t.button.shadow);
  const bg = t.pageBg.type === 'color' ? t.pageBg.value : t.pageBg.type === 'gradient' ? t.pageBg.value : '#0A0A0B';

  return (
    <div
      className={[
        "relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
        active ? "border-gold shadow-[0_0_0_2px_rgba(201,168,106,0.25)]" : "border-border-strong hover:border-gold/40",
      ].join(" ")}
      style={{ width: 120, height: 192, background: bg, flexShrink: 0 }}
    >
      {/* Avatar stub */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white/10 border border-white/20" />
      {/* Name stub */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full" style={{ background: t.title.color, opacity: 0.8 }} />
      {/* Buttons */}
      <div className="absolute bottom-5 left-3 right-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full h-3"
            style={{
              background: t.button.fill.value,
              borderRadius: btnRadius,
              boxShadow: btnShadow,
              opacity: i === 1 ? 1 : i === 2 ? 0.65 : 0.35,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function DesignTab({ theme, userId, onChange }: DesignTabProps) {
  const [bgUploading, setBgUploading] = useState(false);
  const [bgUploadError, setBgUploadError] = useState<string | null>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);

  function patch(partial: Partial<Theme>): Theme {
    return { ...theme, ...partial, preset: 'custom' };
  }

  function applyPreset(key: Exclude<Theme['preset'], 'custom'>) {
    onChange(PRESETS[key]);
  }

  // pageBg helpers
  function setPageBgType(type: Theme['pageBg']['type']) {
    const defaults: Record<Theme['pageBg']['type'], { value: string; overlay: number }> = {
      color:    { value: BG_COLORS[0].value,    overlay: 0 },
      gradient: { value: BG_GRADIENTS[0].value, overlay: 0 },
      image:    { value: theme.pageBg.type === 'image' ? theme.pageBg.value : '', overlay: 0.4 },
    };
    onChange(patch({ pageBg: { type, ...defaults[type] } }));
  }

  function setPageBgColor(value: string) {
    onChange(patch({ pageBg: { ...theme.pageBg, type: 'color', value } }));
  }

  function setPageBgGradient(value: string) {
    onChange(patch({ pageBg: { ...theme.pageBg, type: 'gradient', value } }));
  }

  function setPageBgOverlay(overlay: number) {
    onChange(patch({ pageBg: { ...theme.pageBg, overlay } }));
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
      onChange(patch({ pageBg: { type: 'image', value: publicUrl, overlay: theme.pageBg.overlay > 0 ? theme.pageBg.overlay : 0.4 } }));
    } finally {
      setBgUploading(false);
    }
  }

  // button helpers
  function setButtonFillType(type: Theme['button']['fill']['type']) {
    const defaults: Record<Theme['button']['fill']['type'], string> = {
      color:    BUTTON_COLOR_SWATCHES[5].value,
      gradient: BUTTON_GRADIENT_SWATCHES[0].value,
    };
    onChange(patch({ button: { ...theme.button, fill: { type, value: defaults[type] } } }));
  }

  return (
    <div className="space-y-1 py-2 overflow-hidden">

      {/* ── PRESETS ── */}
      <div>
        <SectionLabel>Presets</SectionLabel>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(PRESETS) as Exclude<Theme['preset'], 'custom'>[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="flex flex-col gap-1.5 cursor-pointer group"
              style={{ width: 120 }}
            >
              <PresetThumb presetKey={key} active={theme.preset === key} />
              <p className={`text-xs font-semibold text-left ${theme.preset === key ? 'text-gold' : 'text-text-muted group-hover:text-text'} transition-colors`}>
                {PRESET_META[key].label}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── PAGE BACKGROUND ── */}
      <div>
        <SectionLabel>Page Background</SectionLabel>
        <SegmentedControl
          options={[
            { id: 'color' as const,    label: 'Color' },
            { id: 'gradient' as const, label: 'Gradient' },
            { id: 'image' as const,    label: 'Image' },
          ]}
          value={theme.pageBg.type}
          onChange={setPageBgType}
        />

        <div className="mt-3">
          {theme.pageBg.type === 'color' && (
            <ColorSwatches
              swatches={BG_COLORS}
              selected={theme.pageBg.value}
              onSelect={setPageBgColor}
              withCustom
            />
          )}
          {theme.pageBg.type === 'gradient' && (
            <GradientSwatches
              swatches={BG_GRADIENTS}
              selected={theme.pageBg.value}
              onSelect={setPageBgGradient}
            />
          )}
          {theme.pageBg.type === 'image' && (
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
                    className="w-14 h-14 rounded-[var(--radius-sm)] object-cover border border-border-strong flex-shrink-0"
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
                <div className="flex items-center justify-between mb-1.5">
                  <SubLabel>Overlay (legibility)</SubLabel>
                  <span className="text-xs text-text-subtle">{Math.round(theme.pageBg.overlay * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.7}
                  step={0.05}
                  value={theme.pageBg.overlay}
                  onChange={(e) => setPageBgOverlay(parseFloat(e.target.value))}
                  className="w-full accent-gold h-1.5 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Divider />

      {/* ── BUTTONS ── */}
      <div className="space-y-5">
        <SectionLabel>Buttons</SectionLabel>

        {/* Fill */}
        <div>
          <SubLabel>Fill</SubLabel>
          <SegmentedControl
            options={[
              { id: 'color'    as const, label: 'Color' },
              { id: 'gradient' as const, label: 'Gradient' },
            ]}
            value={theme.button.fill.type}
            onChange={setButtonFillType}
          />
          <div className="mt-3">
            {theme.button.fill.type === 'color' && (
              <ColorSwatches
                swatches={BUTTON_COLOR_SWATCHES}
                selected={theme.button.fill.value}
                onSelect={(v) => onChange(patch({ button: { ...theme.button, fill: { type: 'color', value: v } } }))}
                withCustom
              />
            )}
            {theme.button.fill.type === 'gradient' && (
              <GradientSwatches
                swatches={BUTTON_GRADIENT_SWATCHES}
                selected={theme.button.fill.value}
                onSelect={(v) => onChange(patch({ button: { ...theme.button, fill: { type: 'gradient', value: v } } }))}
              />
            )}
          </div>
        </div>

        {/* Text colour */}
        <div>
          <SubLabel>Text colour</SubLabel>
          <ColorSwatches
            swatches={TEXT_COLOR_SWATCHES}
            selected={theme.button.textColor}
            onSelect={(v) => onChange(patch({ button: { ...theme.button, textColor: v } }))}
            withCustom
          />
        </div>

        {/* Corners */}
        <div>
          <SubLabel>Corners</SubLabel>
          <div className="grid grid-cols-4 gap-2">
            {BUTTON_CORNERS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange(patch({ button: { ...theme.button, corner: c.id } }))}
                className={[
                  "flex flex-col items-center gap-1.5 py-3 px-2 border text-xs font-medium transition-all cursor-pointer",
                  theme.button.corner === c.id
                    ? "border-gold/60 bg-gold-dim text-gold rounded-[var(--radius-sm)]"
                    : "border-border-strong bg-surface text-text-muted hover:border-gold/30 rounded-[var(--radius-sm)]",
                ].join(" ")}
              >
                <div
                  className="w-8 h-5 bg-surface-2 border border-border-strong"
                  style={{ borderRadius: c.radius }}
                />
                <span className="truncate">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Shadow */}
        <div>
          <SubLabel>Shadow</SubLabel>
          <div className="flex gap-2">
            {BUTTON_SHADOWS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onChange(patch({ button: { ...theme.button, shadow: s.id } }))}
                className={[
                  "flex-1 py-2.5 text-xs font-medium border rounded-[var(--radius-sm)] transition-all cursor-pointer",
                  theme.button.shadow === s.id
                    ? "border-gold/60 bg-gold-dim text-gold"
                    : "border-border-strong bg-surface text-text-muted hover:border-gold/30",
                ].join(" ")}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font */}
        <div>
          <SubLabel>Font</SubLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange(patch({ button: { ...theme.button, font: f.id } }))}
                className={[
                  "px-3 py-2 text-xs border rounded-[var(--radius-sm)] transition-all cursor-pointer text-left truncate",
                  theme.button.font === f.id
                    ? "border-gold/60 bg-gold-dim text-gold"
                    : "border-border-strong bg-surface text-text-muted hover:border-gold/30",
                ].join(" ")}
                style={{ fontFamily: `var(${f.variable})` }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Divider />

      {/* ── TEXT ── */}
      <div className="space-y-5">
        <SectionLabel>Text</SectionLabel>

        {/* Title font */}
        <div>
          <SubLabel>Title font</SubLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange(patch({ title: { ...theme.title, font: f.id } }))}
                className={[
                  "px-3 py-2 text-xs border rounded-[var(--radius-sm)] transition-all cursor-pointer text-left truncate",
                  theme.title.font === f.id
                    ? "border-gold/60 bg-gold-dim text-gold"
                    : "border-border-strong bg-surface text-text-muted hover:border-gold/30",
                ].join(" ")}
                style={{ fontFamily: `var(${f.variable})` }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title colour */}
        <div>
          <SubLabel>Title colour</SubLabel>
          <ColorSwatches
            swatches={TEXT_COLOR_SWATCHES}
            selected={theme.title.color}
            onSelect={(v) => onChange(patch({ title: { ...theme.title, color: v } }))}
            withCustom
          />
        </div>

        {/* Body colour */}
        <div>
          <SubLabel>Body text colour</SubLabel>
          <ColorSwatches
            swatches={TEXT_COLOR_SWATCHES}
            selected={theme.text.color}
            onSelect={(v) => onChange(patch({ text: { color: v } }))}
            withCustom
          />
        </div>
      </div>

      <Divider />

      {/* ── ANIMATION ── */}
      <div>
        <SectionLabel>Animation</SectionLabel>
        <p className="text-xs text-text-subtle mb-3 -mt-1">Plays on button hover. Off by default.</p>
        <div className="grid grid-cols-4 gap-2">
          {ANIMATIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onChange(patch({ animation: a.id }))}
              className={[
                "py-2 text-xs font-medium border rounded-[var(--radius-sm)] transition-all cursor-pointer",
                theme.animation === a.id
                  ? "border-gold/60 bg-gold-dim text-gold"
                  : "border-border-strong bg-surface text-text-muted hover:border-gold/30",
              ].join(" ")}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}
