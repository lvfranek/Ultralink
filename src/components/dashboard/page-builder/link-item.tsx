"use client";

import { useState, useRef, useTransition, useEffect, forwardRef, useImperativeHandle } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import { updateLink, deleteLink } from "@/app/actions/links";
import type { PageLink } from "@/lib/supabase/types";
import { type LinkStyle, resolveLinkStyle, BUTTON_CORNERS, ANIMATIONS, cornerRadius } from "@/lib/config/theme";
import { ColorPickerField, GradientBuilder, SegmentedControl } from "./design-tab";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ─── Link item ────────────────────────────────────────────────────────────────

interface LinkItemProps {
  link: PageLink;
  pageId: string;
  userId: string;
  onUpdate: (updated: PageLink) => void;
  onPreview: (id: string, patch: Partial<PageLink>) => void;
  onDelete: (id: string) => void;
  onDirtyChange: (id: string, dirty: boolean) => void;
}

export interface LinkItemHandle {
  flush: () => Promise<{ ok: true } | { ok: false; error: string }>;
}

export const LinkItem = forwardRef<LinkItemHandle, LinkItemProps>(function LinkItem(
  { link, userId, onUpdate, onPreview, onDelete, onDirtyChange },
  ref,
) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const isHeading = link.item_type === "heading";
  const [expanded, setExpanded] = useState(isHeading && !link.label);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState(link.label);
  const [url, setUrl] = useState(link.url);
  const [isAdult, setIsAdult] = useState(link.is_adult);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(link.icon);

  // Locked at mount and updated only after a successful DB save, so dirty check
  // stays correct even when the link prop updates due to live preview propagation.
  const [savedStyle, setSavedStyle] = useState<LinkStyle>(() => resolveLinkStyle(link));
  const [linkStyle, setLinkStyle] = useState<LinkStyle>(savedStyle);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const iconFileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const saved = savedStyle;
  const dirty =
    label !== link.label ||
    url !== link.url ||
    isAdult !== link.is_adult ||
    selectedIcon !== link.icon ||
    linkStyle.fillType !== saved.fillType ||
    linkStyle.fillValue !== saved.fillValue ||
    linkStyle.textColor !== saved.textColor ||
    linkStyle.corner !== saved.corner ||
    linkStyle.animation !== saved.animation;

  useEffect(() => {
    onDirtyChange(link.id, dirty);
    return () => onDirtyChange(link.id, false);
  }, [dirty, link.id, onDirtyChange]);

  // New empty headings open expanded with focus straight in the label field.
  useEffect(() => {
    if (isHeading && expanded && !link.label) labelInputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- focus the new heading's input only once, when it first appears
  }, []);

  // Update live preview immediately whenever style changes
  function updateStyle(patch: Partial<LinkStyle>) {
    const next = { ...linkStyle, ...patch };
    setLinkStyle(next);
    onPreview(link.id, {
      fill_type: next.fillType,
      fill_value: next.fillValue,
      text_color: next.textColor,
      corner: next.corner,
      animation: next.animation,
    });
  }

  async function save(): Promise<{ ok: true } | { ok: false; error: string }> {
    setSaving(true);
    setError(null);
    const result = await updateLink(link.id, {
      label,
      url,
      is_adult: isAdult,
      icon: selectedIcon,
      fill_type: linkStyle.fillType,
      fill_value: linkStyle.fillValue,
      text_color: linkStyle.textColor,
      corner: linkStyle.corner,
      animation: linkStyle.animation,
    });
    setSaving(false);
    if ("error" in result) {
      setError(result.error);
      return { ok: false, error: result.error };
    }
    setSavedStyle(linkStyle);
    onUpdate({
      ...link,
      label,
      url,
      is_adult: isAdult,
      icon: selectedIcon,
      fill_type: linkStyle.fillType,
      fill_value: linkStyle.fillValue,
      text_color: linkStyle.textColor,
      corner: linkStyle.corner,
      animation: linkStyle.animation,
    });
    return { ok: true };
  }

  // `save` intentionally isn't memoized — it closes over this render's field state,
  // so the handle is rebuilt every render (no deps list) to always flush the latest edits.
  useImperativeHandle(ref, () => ({
    flush: async () => {
      if (!dirty) return { ok: true };
      return save();
    },
  }));

  function handleToggleExpanded() {
    // Collapsing/expanding never persists — edits are only ever written on the
    // page-level Save button via the imperative `flush` handle above.
    setExpanded((v) => !v);
  }

  async function handleIconFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Image files only.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Max 5 MB.");
      return;
    }

    setUploadingIcon(true);
    const supabase = createClient();
    const filename = `${userId}/links/${Date.now()}_icon.png`;
    const { error: upErr } = await supabase.storage.from("media").upload(filename, file, { upsert: true });
    if (upErr) {
      setError(upErr.message);
      setUploadingIcon(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(filename);
    setSelectedIcon(publicUrl);
    onPreview(link.id, { icon: publicUrl });
    setUploadingIcon(false);
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteLink(link.id);
      if ("error" in result) setError(result.error);
      else onDelete(link.id);
    });
  }

  const btnRadius = cornerRadius(linkStyle.corner);
  const btnBg = linkStyle.fillValue;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: "#141414", border: "1px solid rgba(255,255,255,.08)" }}
      className="rounded-[12px] overflow-hidden"
    >
      {/* Row header */}
      <div className={`flex items-center gap-2 px-3 ${isHeading ? "py-2" : "py-3"}`}>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab text-text-subtle hover:text-text-muted p-1 touch-none"
          aria-label="Drag to reorder"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M7 2a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM7 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM7 15a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
          </svg>
        </button>

        {isHeading ? (
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[11px] font-bold text-text-subtle border border-border-strong rounded">
            H
          </span>
        ) : (
          <>
            {/* Colour swatch preview */}
            <span
              className="w-5 h-5 rounded-sm flex-shrink-0 border border-black/10"
              style={{ background: btnBg, borderRadius: btnRadius === "9999px" ? "9999px" : "4px" }}
            />

            {selectedIcon && selectedIcon.startsWith("http") && (
              // eslint-disable-next-line @next/next/no-img-element -- user-uploaded image (Supabase Storage URL), shown as-is rather than through Next's image optimizer
              <img src={selectedIcon} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
            )}
          </>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text truncate">
            {link.label || (isHeading ? "Untitled heading" : "Untitled")}
          </p>
          {!isHeading && <p className="text-xs text-text-subtle truncate">{link.url}</p>}
        </div>

        {!isHeading && link.is_adult && (
          <span className="text-[10px] font-bold text-text-subtle border border-border-strong rounded px-1 flex-shrink-0">
            18+
          </span>
        )}

        {saving && (
          <span className="inline-block w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin text-text-subtle flex-shrink-0" />
        )}

        <button
          type="button"
          onClick={handleToggleExpanded}
          disabled={saving}
          className="flex-shrink-0 text-text-subtle hover:text-text p-1 transition-colors cursor-pointer disabled:opacity-40"
          aria-label={expanded ? "Collapse" : "Edit"}
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Expanded editor */}
      {expanded && isHeading && (
        <div className="border-t border-border px-3 py-4 space-y-5">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Heading text</label>
            <input
              ref={labelInputRef}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Section heading"
              className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>

          <ColorPickerField
            label="Text color"
            value={linkStyle.textColor}
            onChange={(v) => updateStyle({ textColor: v })}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="px-3 py-2 text-xs text-red-400 border border-red-800/40 rounded-[var(--radius-sm)] hover:bg-red-950/30 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}
      {expanded && !isHeading && (
        <div className="border-t border-border px-3 py-4 space-y-5">
          {/* Label + URL */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Button label"
                className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
            </div>
          </div>

          {/* ── STYLE ── */}
          <div className="border-t border-border pt-4 space-y-4">
            <p className="text-xs font-semibold text-text-subtle uppercase tracking-widest">Style</p>

            {/* Fill type toggle */}
            <SegmentedControl
              options={[
                { id: "color" as const, label: "Color" },
                { id: "gradient" as const, label: "Gradient" },
              ]}
              value={linkStyle.fillType}
              onChange={(v) =>
                updateStyle({
                  fillType: v,
                  fillValue:
                    v === "gradient" ? "linear-gradient(135deg, #06AEEF 0%, #A78BFA 100%)" : linkStyle.fillValue,
                })
              }
            />

            {linkStyle.fillType === "color" && (
              <ColorPickerField
                label="Fill color"
                value={linkStyle.fillValue}
                onChange={(v) => updateStyle({ fillValue: v })}
              />
            )}
            {linkStyle.fillType === "gradient" && (
              <GradientBuilder value={linkStyle.fillValue} onChange={(v) => updateStyle({ fillValue: v })} />
            )}

            <ColorPickerField
              label="Text color"
              value={linkStyle.textColor}
              onChange={(v) => updateStyle({ textColor: v })}
            />

            {/* Corners */}
            <div>
              <p className="text-xs font-medium text-text-muted mb-2">Corners</p>
              <SegmentedControl
                options={BUTTON_CORNERS.map((c) => ({ id: c.id, label: c.label }))}
                value={linkStyle.corner}
                onChange={(v) => updateStyle({ corner: v })}
              />
            </div>

            {/* Animation */}
            <div>
              <p className="text-xs font-medium text-text-muted mb-2">Animation</p>
              <SegmentedControl
                options={ANIMATIONS.map((a) => ({ id: a.id, label: a.label }))}
                value={linkStyle.animation}
                onChange={(v) => updateStyle({ animation: v })}
              />
            </div>
          </div>

          {/* Icon picker */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-text-muted">Icon</label>
              {selectedIcon && selectedIcon.startsWith("http") && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIcon(null);
                    onPreview(link.id, { icon: null });
                  }}
                  className="text-xs text-text-subtle hover:text-red-400 cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedIcon && selectedIcon.startsWith("http") && (
                // eslint-disable-next-line @next/next/no-img-element -- user-uploaded image (Supabase Storage URL), shown as-is rather than through Next's image optimizer
                <img
                  src={selectedIcon}
                  alt="Icon"
                  className="w-8 h-8 object-contain rounded-[var(--radius-sm)] border border-border flex-shrink-0"
                />
              )}
              <input
                ref={iconFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleIconFileUpload}
              />
              <button
                type="button"
                onClick={() => iconFileRef.current?.click()}
                disabled={uploadingIcon}
                className="text-xs text-text-muted border border-border-strong px-2.5 py-1.5 rounded cursor-pointer hover:bg-surface disabled:opacity-50"
              >
                {uploadingIcon ? "Uploading…" : selectedIcon ? "Change icon" : "Upload icon"}
              </button>
            </div>
          </div>

          {/* 18+ gate toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text">18+ gate</p>
              <p className="text-xs text-text-subtle">Visitor must confirm age before opening this link</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAdult}
              onClick={() => setIsAdult((v) => !v)}
              className={[
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer",
                isAdult ? "bg-emerald-500" : "bg-surface-2 border border-border-strong",
              ].join(" ")}
            >
              <span
                className={`inline-block h-3 w-3 rounded-full bg-white transition-transform shadow-sm ${isAdult ? "translate-x-5" : "translate-x-1"}`}
              />
            </button>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="px-3 py-2 text-xs text-red-400 border border-red-800/40 rounded-[var(--radius-sm)] hover:bg-red-950/30 transition-colors disabled:opacity-40 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Social item ──────────────────────────────────────────────────────────────
