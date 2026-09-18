"use client";

import { useState, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SOCIAL_PLATFORMS } from "@/lib/config/socials";
import { SocialIcon } from "@/components/public/social-icon";
import { deleteSocial, updateSocial } from "@/app/actions/socials";
import type { PageSocial } from "@/lib/supabase/types";

interface SocialItemProps {
  social: PageSocial;
  onUpdate: (updated: PageSocial) => void;
  onDelete: (id: string) => void;
}

export function SocialItem({ social, onUpdate, onDelete }: SocialItemProps) {
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
            {editing ? (
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            ) : (
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            )}
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
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1">URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={SOCIAL_PLATFORMS.find((p) => p.id === platform)?.placeholder}
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
