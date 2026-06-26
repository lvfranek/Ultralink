"use client";

import { useRef, useState } from "react";
import { AvatarCropModal } from "./avatar-crop-modal";
import { createClient } from "@/lib/supabase/client";
import type { Page, AvatarStyle, Plan } from "@/lib/supabase/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ProfileTabProps {
  page: Pick<Page, "title" | "bio" | "avatar_url" | "avatar_style" | "active_badge" | "age_gate_enabled">;
  plan: Plan;
  userId: string;
  onChange: (patch: Partial<Pick<Page, "title" | "bio" | "avatar_url" | "avatar_style" | "active_badge" | "age_gate_enabled">>) => void;
}

export function ProfileTab({ page, plan, userId, onChange }: ProfileTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const canUseBadge = plan === "creator" || plan === "agency";

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
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filename, blob, { contentType: "image/jpeg", upsert: true });

      if (uploadError) {
        setUploadError(uploadError.message);
        return;
      }

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
    <div className="space-y-6 py-2">
      {/* Avatar */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-3">
          Profile photo
        </label>
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="flex-shrink-0">
            {page.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={page.avatar_url}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-gold/30"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-bg"
                style={{ background: "linear-gradient(135deg, #E6C878 0%, #C9A86A 100%)" }}
              >
                {(page.title || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
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
              className="px-3.5 py-1.5 text-xs font-medium border border-border-strong text-text rounded-[var(--radius-sm)] hover:bg-surface-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploading ? "Uploading…" : page.avatar_url ? "Change photo" : "Upload photo"}
            </button>
            {page.avatar_url && (
              <button
                type="button"
                onClick={removeAvatar}
                className="px-3.5 py-1.5 text-xs text-text-subtle hover:text-red-400 transition-colors cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        {uploadError && (
          <p className="mt-2 text-xs text-red-400">{uploadError}</p>
        )}
        <p className="mt-1.5 text-xs text-text-subtle">JPEG, PNG, WebP or GIF · max 5 MB</p>
      </div>

      {/* Avatar style */}
      <div>
        <label className="block text-sm font-medium text-text-muted mb-2">
          Avatar style
        </label>
        <div className="flex gap-2">
          {(["circle", "hero"] as AvatarStyle[]).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onChange({ avatar_style: style })}
              className={[
                "flex flex-col items-center gap-1 p-2 rounded-[var(--radius-sm)] border text-xs font-medium transition-all cursor-pointer w-16",
                page.avatar_style === style
                  ? "border-gold/60 bg-gold-dim text-gold"
                  : "border-border-strong bg-surface text-text-muted hover:border-gold/30",
              ].join(" ")}
            >
              {style === "circle" ? (
                <div className="w-6 h-6 rounded-full bg-surface-2 border border-border-strong" />
              ) : (
                <div className="w-10 h-4 rounded-sm bg-gradient-to-b from-surface-2 to-bg border border-border-strong" />
              )}
              <span className="capitalize">{style}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="max-w-xs">
        <label htmlFor="prof-title" className="block text-sm font-medium text-text-muted mb-1.5">
          Name
        </label>
        <input
          id="prof-title"
          type="text"
          value={page.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Your name or brand"
          className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-colors"
        />
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="prof-bio" className="block text-sm font-medium text-text-muted mb-1.5">
          Short description <span className="text-text-subtle font-normal">(optional)</span>
        </label>
        <textarea
          id="prof-bio"
          value={page.bio ?? ""}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Tell visitors what you're about"
          rows={3}
          className="w-full bg-surface-2 border border-border-strong text-text placeholder-text-subtle rounded-[var(--radius)] px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-colors"
        />
      </div>

      {/* Active badge */}
      <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-[var(--radius)]">
        <div>
          <p className="text-sm font-medium text-text flex items-center gap-2">
            Active now badge
            {!canUseBadge && (
              <span className="text-[10px] px-1.5 py-0.5 bg-gold-dim text-gold border border-gold/20 rounded font-semibold uppercase tracking-wider">
                Creator+
              </span>
            )}
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            Shows a green "Active now" indicator on your page
          </p>
        </div>
        {canUseBadge ? (
          <button
            type="button"
            role="switch"
            aria-checked={page.active_badge}
            onClick={() => onChange({ active_badge: !page.active_badge })}
            className={[
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer",
              page.active_badge ? "bg-emerald-500" : "bg-surface-2 border border-border-strong",
            ].join(" ")}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${page.active_badge ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        ) : (
          <a
            href="/#pricing"
            className="text-xs text-gold hover:text-gold-bright transition-colors"
          >
            Upgrade →
          </a>
        )}
      </div>

      {/* Age gate */}
      <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-[var(--radius)]">
        <div>
          <p className="text-sm font-medium text-text">18+ Age gate</p>
          <p className="text-xs text-text-muted mt-0.5">
            Shows a full-screen age confirmation before revealing your page
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={page.age_gate_enabled}
          onClick={() => onChange({ age_gate_enabled: !page.age_gate_enabled })}
          className={[
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer flex-shrink-0",
            page.age_gate_enabled ? "bg-emerald-500" : "bg-surface-2 border border-border-strong",
          ].join(" ")}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${page.age_gate_enabled ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      {page.age_gate_enabled && (
        <div className="px-4 py-3 bg-gold-dim border border-gold/20 rounded-[var(--radius)] text-xs text-text-muted leading-relaxed">
          When enabled, visitors see a consent screen before accessing your page.
          The confirmation is remembered for their browser session.
        </div>
      )}

      {/* Phase 5 stubs */}
      <div className="mt-2 space-y-3">
        <p className="text-xs font-medium text-text-subtle uppercase tracking-widest">Coming in Phase 5</p>
        {[
          { label: "Custom Domain", description: "Point your own domain (e.g. links.yourbrand.com) to this page." },
          { label: "Geo-Blocking", description: "Restrict access to specific countries or regions." },
          { label: "Win-Back", description: "Show a prompt to visitors who start to leave, offering a second destination." },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between p-4 bg-surface border border-border rounded-[var(--radius)] opacity-60"
          >
            <div>
              <p className="text-sm font-medium text-text flex items-center gap-2">
                {item.label}
                <span className="text-[10px] px-1.5 py-0.5 bg-surface-2 text-text-subtle border border-border-strong rounded font-semibold uppercase tracking-wider">
                  Phase 5
                </span>
              </p>
              <p className="text-xs text-text-muted mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Crop modal */}
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
