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
} from "@dnd-kit/sortable";
import { addLink, reorderLinks } from "@/app/actions/links";
import { SOCIAL_PLATFORMS } from "@/lib/config/socials";
import { addSocial, reorderSocials } from "@/app/actions/socials";
import type { PageLink, PageSocial } from "@/lib/supabase/types";
import { ColorPickerField } from "./design-tab";
import { SettingsCard, FieldRow } from "./panel-primitives";
import { LinkItemHandle, LinkItem } from "./link-item";
import { SocialItem } from "./social-item";

const MAX_SOCIALS = 20;

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

export const LinksTab = forwardRef<LinksTabHandle, LinksTabProps>(function LinksTab(
  { pageId, userId, links, onLinksChange, socials, onSocialsChange, onDirtyChange, iconsColor, onIconsColorChange },
  ref,
) {
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

  useImperativeHandle(
    ref,
    () => ({
      flushDirtyLinks: async () => {
        for (const link of links) {
          const handle = linkItemRefs.current.get(link.id);
          if (!handle) continue;
          const result = await handle.flush();
          if (!result.ok) return result;
        }
        return { ok: true };
      },
    }),
    [links],
  );

  const linksSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const socialsSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleLinkDirtyChange = useCallback((id: string, dirty: boolean) => {
    setDirtyLinkIds((prev) => {
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
    reorderLinks(
      pageId,
      reordered.map((l) => l.id),
    );
  }

  function handleSocialsDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = socials.findIndex((s) => s.id === active.id);
    const newIndex = socials.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(socials, oldIndex, newIndex).map((s, i) => ({ ...s, position: i }));
    onSocialsChange(reordered);
    reorderSocials(
      pageId,
      reordered.map((s) => s.id),
    );
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
      <SettingsCard
        title="Buttons"
        defaultOpen
        summary={links.length > 0 ? `${links.length} button${links.length !== 1 ? "s" : ""}` : "None yet"}
      >
        {links.length === 0 && !adding && (
          <div className="text-center py-8 text-text-muted">
            <p className="text-sm mb-1">No buttons yet</p>
            <p className="text-xs text-text-subtle">Add your first link button below</p>
          </div>
        )}

        <DndContext
          id="links-dnd"
          sensors={linksSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleLinksDragEnd}
        >
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
          <div
            className="rounded-[10px] p-3 space-y-3 mt-1"
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}
          >
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
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSubmit();
              }}
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
                onClick={() => {
                  setAdding(false);
                  setAddError(null);
                }}
                className="px-3 py-2 text-xs text-text-muted border border-border-strong rounded-[var(--radius-sm)] hover:bg-surface-2 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : addingHeading ? (
          <div
            className="rounded-[10px] p-3 space-y-3 mt-1"
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}
          >
            <p className="text-sm font-medium text-text">New heading</p>
            <input
              type="text"
              value={newHeadingLabel}
              onChange={(e) => setNewHeadingLabel(e.target.value)}
              placeholder="Section heading"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddHeadingSubmit();
              }}
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
                onClick={() => {
                  setAddingHeading(false);
                  setAddError(null);
                }}
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
                onClick={() => {
                  setAdding(true);
                  setAddError(null);
                }}
                className="flex-1 py-2.5 border border-dashed border-gold/30 text-gold text-sm font-medium rounded-[var(--radius)] hover:border-gold/60 hover:bg-gold-dim transition-all cursor-pointer"
              >
                + Add button
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingHeading(true);
                  setAddError(null);
                }}
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
            <ColorPickerField label="Social icons color" value={iconsColor} onChange={onIconsColorChange} inline />
          </FieldRow>
        </div>

        {socials.length === 0 && !addingSocial && (
          <div className="text-center py-6 text-text-muted">
            <p className="text-sm mb-1">No social icons yet</p>
            <p className="text-xs text-text-subtle">Add your social profiles below</p>
          </div>
        )}

        <DndContext
          id="socials-dnd"
          sensors={socialsSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSocialsDragEnd}
        >
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
          <div
            className="rounded-[10px] p-3 space-y-3 mt-1"
            style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}
          >
            <p className="text-sm font-medium text-text">Add social link</p>
            <select
              value={newPlatform}
              onChange={(e) => {
                setNewPlatform(e.target.value);
                setNewSocialUrl("");
              }}
              className="w-full bg-surface-2 border border-border-strong text-text rounded-[var(--radius-sm)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 cursor-pointer"
            >
              {SOCIAL_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newSocialUrl}
              onChange={(e) => setNewSocialUrl(e.target.value)}
              placeholder={SOCIAL_PLATFORMS.find((p) => p.id === newPlatform)?.placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSocialSubmit();
              }}
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
                onClick={() => {
                  setAddingSocial(false);
                  setAddSocialError(null);
                }}
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
