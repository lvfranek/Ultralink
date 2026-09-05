"use client";

import { useState, useRef, useTransition, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import { addLink, updateLink, deleteLink, reorderLinks } from "@/app/actions/links";
import { SOCIAL_PLATFORMS } from "@/lib/config/socials";
import { SocialIcon } from "@/components/public/social-icon";
import { addSocial, deleteSocial, reorderSocials, updateSocial } from "@/app/actions/socials";
import type { PageLink, PageSocial } from "@/lib/supabase/types";
import type { LinkStyle } from "@/lib/config/theme";
import { resolveLinkStyle, BUTTON_CORNERS, ANIMATIONS, cornerRadius } from "@/lib/config/theme";
import { ColorPickerField, GradientBuilder, SegmentedControl } from "./design-tab";
import { SettingsCard, FieldRow } from "./panel-primitives";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SOCIALS = 20;

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

const LinkItem = forwardRef<LinkItemHandle, LinkItemProps>(function LinkItem({ link, pageId, userId, onUpdate, onPreview, onDelete, onDirtyChange }, ref) {
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
  const savedStyleRef = useRef<LinkStyle>(resolveLinkStyle(link));
  const [linkStyle, setLinkStyle] = useState<LinkStyle>(savedStyleRef.current);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const iconFileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const saved = savedStyleRef.current;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    savedStyleRef.current = linkStyle;
    onUpdate({
      ...link,
      label, url, is_adult: isAdult, icon: selectedIcon,
      fill_type: linkStyle.fillType, fill_value: linkStyle.fillValue, text_color: linkStyle.textColor,
      corner: linkStyle.corner, animation: linkStyle.animation,
    });
    return { ok: true };
  }

  // `save` intentionally isn't memoized — it closes over this render's field state,
  // so the handle must be rebuilt every render to always flush the latest edits.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useImperativeHandle(ref, () => ({
    flush: async () => {
      if (!dirty) return { ok: true };
      return save();
    },
  }), [dirty, save]);

  function handleToggleExpanded() {
    // Collapsing/expanding never persists — edits are only ever written on the
    // page-level Save button via the imperative `flush` handle above.
    setExpanded((v) => !v);
  }

  async function handleIconFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!ALLOWED_TYPES.includes(file.type)) { setError("Image files only."); return; }
    if (file.size > MAX_FILE_SIZE) { setError("Max 5 MB."); return; }

    setUploadingIcon(true);
    const supabase = createClient();
    const filename = `${userId}/links/${Date.now()}_icon.png`;
    const { error: upErr } = await supabase.storage.from("media").upload(filename, file, { upsert: true });
    if (upErr) { setError(upErr.message); setUploadingIcon(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(filename);
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
              style={{ background: btnBg, borderRadius: btnRadius === '9999px' ? '9999px' : '4px' }}
            />

            {selectedIcon && selectedIcon.startsWith("http") && (
              // eslint-disable-next-line @next/next/no-img-element
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
          <span className="text-[10px] font-bold text-text-subtle border border-border-strong rounded px-1 flex-shrink-0">18+</span>
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
          <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}>
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
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
                { id: 'color' as const,    label: 'Color' },
                { id: 'gradient' as const, label: 'Gradient' },
              ]}
              value={linkStyle.fillType}
              onChange={(v) => updateStyle({ fillType: v, fillValue: v === 'gradient' ? 'linear-gradient(135deg, #06AEEF 0%, #A78BFA 100%)' : linkStyle.fillValue })}
            />

            {linkStyle.fillType === 'color' && (
              <ColorPickerField
                label="Fill color"
                value={linkStyle.fillValue}
                onChange={(v) => updateStyle({ fillValue: v })}
              />
            )}
            {linkStyle.fillType === 'gradient' && (
              <GradientBuilder
                value={linkStyle.fillValue}
                onChange={(v) => updateStyle({ fillValue: v })}
              />
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
                  onClick={() => { setSelectedIcon(null); onPreview(link.id, { icon: null }); }}
                  className="text-xs text-text-subtle hover:text-red-400 cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedIcon && selectedIcon.startsWith("http") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedIcon} alt="Icon" className="w-8 h-8 object-contain rounded-[var(--radius-sm)] border border-border flex-shrink-0" />
              )}
              <input ref={iconFileRef} type="file" accept="image/*" className="hidden" onChange={handleIconFileUpload} />
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
              <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform shadow-sm ${isAdult ? "translate-x-5" : "translate-x-1"}`} />
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

interface SocialItemProps {
  social: PageSocial;
  onUpdate: (updated: PageSocial) => void;
  onDelete: (id: string) => void;
}

function SocialItem({ social, onUpdate, onDelete }: SocialItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: social.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const [editing, setEditing] = useState(false);
  const [platform, setPlatform] = useState(social.platform);
  const [url, setUrl] = useState(social.url);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const platformDef = SOCIAL_PLATFORMS.find((p) => p.id === social.platform);

  async function save() {
    setSaving(true);
    setError(null);
    const result = await updateSocial(social.id, { platform, url });
    setSaving(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      onUpdate({ ...social, platform, url });
      setEditing(false);
    }
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteSocial(social.id);
      if ("error" in result) setError(result.error);
      else onDelete(social.id);
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: "#141414", border: "1px solid rgba(255,255,255,.08)" }}
      className="rounded-[12px] overflow-hidden"
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
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

        <span className="flex-shrink-0 text-text-muted">
          <SocialIcon platform={social.platform} size={18} />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text">{platformDef?.label ?? social.platform}</p>
          <p className="text-xs text-text-subtle truncate">{social.url}</p>
        </div>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="flex-shrink-0 text-text-subtle hover:text-text p-1 cursor-pointer"
          aria-label={editing ? "Close" : "Edit"}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            {editing
              ? <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              : <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            }
          </svg>
        </button>
      </div>

      {editing && (
        <div className="border-t border-border px-3 py-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-surface-2 border border-border-strong text-text rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 cursor-pointer"
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={SOCIAL_PLATFORMS.find(p => p.id === platform)?.placeholder}
              className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex-1 py-1.5 text-xs font-semibold bg-gold text-bg rounded-[var(--radius-sm)] hover:bg-gold-bright disabled:opacity-40 cursor-pointer"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="px-3 py-1.5 text-xs text-red-400 border border-red-800/40 rounded-[var(--radius-sm)] hover:bg-red-950/30 disabled:opacity-40 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Links tab ────────────────────────────────────────────────────────────────

interface LinksTabProps {
  pageId: string;
  userId: string;
  links: PageLink[];
  onLinksChange: (links: PageLink[]) => void;
  socials: PageSocial[];
  onSocialsChange: (socials: PageSocial[]) => void;
  onDirtyChange?: (hasDirty: boolean) => void;
  iconsColor: string;
  onIconsColorChange: (color: string) => void;
}

export interface LinksTabHandle {
  /** Persists every unsaved per-link edit. Called by the page-level Save button. */
  flushDirtyLinks: () => Promise<{ ok: true } | { ok: false; error: string }>;
}

export const LinksTab = forwardRef<LinksTabHandle, LinksTabProps>(function LinksTab({ pageId, userId, links, onLinksChange, socials, onSocialsChange, onDirtyChange, iconsColor, onIconsColorChange }, ref) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, startAdding] = useTransition();

  const [addingHeading, setAddingHeading] = useState(false);
  const [newHeadingLabel, setNewHeadingLabel] = useState("");

  const [addingSocial, setAddingSocial] = useState(false);
  const [newPlatform, setNewPlatform] = useState(SOCIAL_PLATFORMS[0].id);
  const [newSocialUrl, setNewSocialUrl] = useState("");
  const [addSocialError, setAddSocialError] = useState<string | null>(null);
  const [isAddingSocial, startAddingSocial] = useTransition();

  const [dirtyLinkIds, setDirtyLinkIds] = useState<Set<string>>(new Set());
  const linkItemRefs = useRef<Map<string, LinkItemHandle>>(new Map());

  useImperativeHandle(ref, () => ({
    flushDirtyLinks: async () => {
      for (const link of links) {
        const handle = linkItemRefs.current.get(link.id);
        if (!handle) continue;
        const result = await handle.flush();
        if (!result.ok) return result;
      }
      return { ok: true };
    },
  }), [links]);

  const linksSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const socialsSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleLinkDirtyChange = useCallback((id: string, dirty: boolean) => {
    setDirtyLinkIds(prev => {
      const next = new Set(prev);
      if (dirty) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  useEffect(() => {
    onDirtyChange?.(dirtyLinkIds.size > 0);
  }, [dirtyLinkIds, onDirtyChange]);

  function handleLinksDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex).map((l, i) => ({ ...l, position: i }));
    onLinksChange(reordered);
    reorderLinks(pageId, reordered.map((l) => l.id));
  }

  function handleSocialsDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = socials.findIndex((s) => s.id === active.id);
    const newIndex = socials.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(socials, oldIndex, newIndex).map((s, i) => ({ ...s, position: i }));
    onSocialsChange(reordered);
    reorderSocials(pageId, reordered.map((s) => s.id));
  }

  function handleAddSubmit() {
    setAddError(null);
    startAdding(async () => {
      const result = await addLink(pageId, { label: newLabel.trim(), url: newUrl.trim() });
      if ("error" in result) {
        setAddError(result.error);
      } else if (result.link) {
        onLinksChange([...links, result.link]);
        setNewLabel("");
        setNewUrl("");
        setAdding(false);
      }
    });
  }

  function handleAddHeadingSubmit() {
    setAddError(null);
    startAdding(async () => {
      const result = await addLink(pageId, { label: newHeadingLabel.trim(), url: "", item_type: "heading" });
      if ("error" in result) {
        setAddError(result.error);
      } else if (result.link) {
        onLinksChange([...links, result.link]);
        setNewHeadingLabel("");
        setAddingHeading(false);
      }
    });
  }

  function handleAddSocialSubmit() {
    setAddSocialError(null);
    startAddingSocial(async () => {
      const result = await addSocial(pageId, { platform: newPlatform, url: newSocialUrl.trim() });
      if ("error" in result) {
        setAddSocialError(result.error);
      } else if (result.social) {
        onSocialsChange([...socials, result.social]);
        setNewSocialUrl("");
        setAddingSocial(false);
      }
    });
  }

  const atSocialCap = socials.length >= MAX_SOCIALS;

  return (
    <div className="space-y-2.5">

      {/* ── Buttons card (open by default) ── */}
      <SettingsCard title="Buttons" defaultOpen summary={links.length > 0 ? `${links.length} button${links.length !== 1 ? "s" : ""}` : "None yet"}>
        {links.length === 0 && !adding && (
          <div className="text-center py-8 text-text-muted">
            <p className="text-sm mb-1">No buttons yet</p>
            <p className="text-xs text-text-subtle">Add your first link button below</p>
          </div>
        )}

        <DndContext id="links-dnd" sensors={linksSensors} collisionDetection={closestCenter} onDragEnd={handleLinksDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 mb-2">
              {links.map((link) => (
                <LinkItem
                  key={link.id}
                  ref={(handle) => {
                    if (handle) linkItemRefs.current.set(link.id, handle);
                    else linkItemRefs.current.delete(link.id);
                  }}
                  link={link}
                  pageId={pageId}
                  userId={userId}
                  onUpdate={(updated) => onLinksChange(links.map((l) => (l.id === updated.id ? updated : l)))}
                  onPreview={(id, patch) => onLinksChange(links.map((l) => (l.id === id ? { ...l, ...patch } : l)))}
                  onDelete={(id) => onLinksChange(links.filter((l) => l.id !== id))}
                  onDirtyChange={handleLinkDirtyChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {adding ? (
          <div className="rounded-[10px] p-3 space-y-3 mt-1" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
            <p className="text-sm font-medium text-text">New button</p>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label"
              className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              onKeyDown={(e) => { if (e.key === "Enter") handleAddSubmit(); }}
              className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            {addError && <p className="text-xs text-red-400">{addError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddSubmit}
                disabled={isAdding || !newLabel.trim() || !newUrl.trim()}
                className="flex-1 py-2 text-xs font-semibold bg-gold text-bg rounded-[var(--radius-sm)] hover:bg-gold-bright transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isAdding ? "Adding…" : "Add button"}
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setAddError(null); }}
                className="px-3 py-2 text-xs text-text-muted border border-border-strong rounded-[var(--radius-sm)] hover:bg-surface-2 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : addingHeading ? (
          <div className="rounded-[10px] p-3 space-y-3 mt-1" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
            <p className="text-sm font-medium text-text">New heading</p>
            <input
              type="text"
              value={newHeadingLabel}
              onChange={(e) => setNewHeadingLabel(e.target.value)}
              placeholder="Section heading"
              onKeyDown={(e) => { if (e.key === "Enter") handleAddHeadingSubmit(); }}
              className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            {addError && <p className="text-xs text-red-400">{addError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddHeadingSubmit}
                disabled={isAdding || !newHeadingLabel.trim()}
                className="flex-1 py-2 text-xs font-semibold bg-gold text-bg rounded-[var(--radius-sm)] hover:bg-gold-bright transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isAdding ? "Adding…" : "Add heading"}
              </button>
              <button
                type="button"
                onClick={() => { setAddingHeading(false); setAddError(null); }}
                className="px-3 py-2 text-xs text-text-muted border border-border-strong rounded-[var(--radius-sm)] hover:bg-surface-2 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {addError && <p className="text-xs text-red-400">{addError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setAdding(true); setAddError(null); }}
                className="flex-1 py-2.5 border border-dashed border-gold/30 text-gold text-sm font-medium rounded-[var(--radius)] hover:border-gold/60 hover:bg-gold-dim transition-all cursor-pointer"
              >
                + Add button
              </button>
              <button
                type="button"
                onClick={() => { setAddingHeading(true); setAddError(null); }}
                className="flex-1 py-2.5 border border-dashed border-gold/30 text-gold text-sm font-medium rounded-[var(--radius)] hover:border-gold/60 hover:bg-gold-dim transition-all cursor-pointer"
              >
                + Add heading
              </button>
            </div>
          </div>
        )}
      </SettingsCard>

      {/* ── Social icons card (collapsed by default) ── */}
      <SettingsCard
        title="Social icons"
        summary={socials.length > 0 ? `${socials.length} icon${socials.length !== 1 ? "s" : ""}` : "None yet"}
      >
        <div className="mb-3 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          <FieldRow label="Color">
            <ColorPickerField
              label="Social icons color"
              value={iconsColor}
              onChange={onIconsColorChange}
              inline
            />
          </FieldRow>
        </div>

        {socials.length === 0 && !addingSocial && (
          <div className="text-center py-6 text-text-muted">
            <p className="text-sm mb-1">No social icons yet</p>
            <p className="text-xs text-text-subtle">Add your social profiles below</p>
          </div>
        )}

        <DndContext id="socials-dnd" sensors={socialsSensors} collisionDetection={closestCenter} onDragEnd={handleSocialsDragEnd}>
          <SortableContext items={socials.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 mb-2">
              {socials.map((social) => (
                <SocialItem
                  key={social.id}
                  social={social}
                  onUpdate={(updated) => onSocialsChange(socials.map((s) => (s.id === updated.id ? updated : s)))}
                  onDelete={(id) => onSocialsChange(socials.filter((s) => s.id !== id))}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {addingSocial ? (
          <div className="rounded-[10px] p-3 space-y-3 mt-1" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
            <p className="text-sm font-medium text-text">Add social link</p>
            <select
              value={newPlatform}
              onChange={(e) => { setNewPlatform(e.target.value); setNewSocialUrl(""); }}
              className="w-full bg-surface-2 border border-border-strong text-text rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 cursor-pointer"
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={newSocialUrl}
              onChange={(e) => setNewSocialUrl(e.target.value)}
              placeholder={SOCIAL_PLATFORMS.find(p => p.id === newPlatform)?.placeholder}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddSocialSubmit(); }}
              className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            {addSocialError && <p className="text-xs text-red-400">{addSocialError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddSocialSubmit}
                disabled={isAddingSocial || !newSocialUrl.trim()}
                className="flex-1 py-2 text-xs font-semibold bg-gold text-bg rounded-[var(--radius-sm)] hover:bg-gold-bright disabled:opacity-40 cursor-pointer"
              >
                {isAddingSocial ? "Adding…" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => { setAddingSocial(false); setAddSocialError(null); }}
                className="px-3 py-2 text-xs text-text-muted border border-border-strong rounded-[var(--radius-sm)] hover:bg-surface-2 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          !atSocialCap && (
            <button
              type="button"
              onClick={() => setAddingSocial(true)}
              className="w-full py-2.5 border border-dashed border-border-strong/60 text-text-muted text-sm font-medium rounded-[var(--radius)] hover:border-border-strong hover:bg-surface transition-all cursor-pointer"
            >
              + Add social icon
            </button>
          )
        )}

        {atSocialCap && (
          <p className="text-xs text-text-subtle text-center mt-2">Maximum of {MAX_SOCIALS} social links reached.</p>
        )}
      </SettingsCard>

    </div>
  );
});
