"use client";

import { useRef, useState } from "react";
import { AvatarCropModal } from "./avatar-crop-modal";
import { createClient } from "@/lib/supabase/client";
import type { Page, AvatarStyle } from "@/lib/supabase/types";
import { FieldRow } from "./panel-primitives";
import { SegmentedControl } from "./design-tab";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ProfileTabProps {
  page: Pick<Page, "title" | "bio" | "avatar_url" | "avatar_style">;
  userId: string;
  onChange: (patch: Partial<Pick<Page, "title" | "bio" | "avatar_url" | "avatar_style">>) => void;
}

export function ProfileTab({ page, userId, onChange }: ProfileTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Please select a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Image must be under 5 MB.");
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleCropApply(blob: Blob) {
    setCropSrc(null);
    setUploading(true);
    setUploadError(null);
    try {
      const supabase = createClient();
      const filename = `${userId}/avatars/${Date.now()}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from("media")
        .upload(filename, blob, { contentType: "image/jpeg", upsert: true });
      if (uploadErr) { setUploadError(uploadErr.message); return; }
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(filename);
      onChange({ avatar_url: publicUrl });
    } finally {
      setUploading(false);
    }
  }

  function removeAvatar() {
    onChange({ avatar_url: null as unknown as string });
  }

  return (
    <div>
      {/* Avatar photo row */}
      <FieldRow label="Photo">
        <div className="flex items-center gap-2">
          {page.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.avatar_url}
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ background: "#ffffff", color: "#0A0A0B" }}
            >
              {(page.title || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-2.5 py-1 text-xs font-medium border border-border-strong text-text rounded-[var(--radius-sm)] hover:bg-surface-2 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {uploading ? "…" : page.avatar_url ? "Change" : "Upload"}
          </button>
          {page.avatar_url && (
            <button
              type="button"
              onClick={removeAvatar}
              className="px-2.5 py-1 text-xs font-medium border border-border-strong text-text-subtle hover:text-red-400 hover:border-red-800/40 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
            >
              Remove
            </button>
          )}
        </div>
      </FieldRow>

      {uploadError && <p className="text-xs text-red-400 pb-1">{uploadError}</p>}

      {/* Avatar style row — segmented control, full flex-1 width */}
      <FieldRow label="Style">
        <SegmentedControl
          options={[
            { id: "circle" as AvatarStyle, label: "Circle" },
            { id: "hero"   as AvatarStyle, label: "Hero" },
          ]}
          value={page.avatar_style ?? "circle"}
          onChange={(v) => onChange({ avatar_style: v })}
        />
      </FieldRow>

      {page.avatar_style === "hero" && !page.avatar_url && (
        <p className="text-xs text-text-subtle pb-1 pt-0.5 pl-0">
          Hero style needs a photo — upload one to enable.
        </p>
      )}

      {/* Name row — full flex-1 width */}
      <FieldRow label="Name">
        <input
          type="text"
          value={page.title ?? ""}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Your name or brand"
          className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius-sm)] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
      </FieldRow>

      {/* Bio — label-left layout matching Name's indentation */}
      <div
        className="flex gap-3 py-2.5"
        style={{ borderTop: "1px solid rgba(255,255,255,.06)", alignItems: "flex-start" }}
      >
        <span className="text-sm text-text-muted flex-shrink-0 min-w-[72px] pt-1.5">Bio</span>
        <div className="flex-1">
          <textarea
            value={page.bio ?? ""}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Tell visitors what you're about"
            rows={3}
            className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius)] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/40 transition-colors"
          />
        </div>
      </div>

      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onCancel={() => setCropSrc(null)}
          onApply={handleCropApply}
        />
      )}
    </div>
  );
}
