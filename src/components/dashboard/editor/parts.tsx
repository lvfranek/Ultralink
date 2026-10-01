"use client";

import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cx, Dialog } from "@/components/app/ui";
import s from "@/components/app/app.module.css";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function imageProblem(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return "Use a JPG, PNG, WebP or GIF image.";
  if (file.size > IMAGE_MAX_BYTES) return "Images can be up to 5 MB.";
  return null;
}

/** Puts a file in the public "media" bucket under the user's folder and returns its URL */
export async function uploadMedia(path: string, file: Blob, contentType?: string): Promise<string> {
  const supabase = createClient();
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: true, contentType });
  if (error) throw error;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

export function Card({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <section className={cx(s.card, s.noSpot, s.edCard)} aria-labelledby={id}>
      <div className={s.edCardHead}>
        <h2 id={id} className={s.cardTitle}>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cx(s.switch, checked && s.switchOn)}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

export function ProBadge() {
  return <span className={s.proBadge}>PRO</span>;
}

// ─── Button icon ─────────────────────────────────────────────────────────────

export function IconPicker({
  icon,
  label,
  userId,
  onChange,
}: {
  icon: string | null;
  label: string;
  userId: string;
  onChange: (icon: string | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pick = async (file: File) => {
    const problem = imageProblem(file);
    if (problem) return setError(problem);
    setError(null);
    setUploading(true);
    try {
      const ext = file.type.split("/")[1] ?? "png";
      onChange(await uploadMedia(`${userId}/links/${Date.now()}_icon.${ext}`, file, file.type));
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={s.iconPicker}>
      <span className={s.iconPreview} aria-hidden="true">
        {uploading ? (
          <Loader2 size={16} className={s.spin} />
        ) : icon ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded image (Supabase Storage URL)
          <img src={icon} alt="" />
        ) : (
          <ImagePlus size={16} />
        )}
      </span>
      <button
        type="button"
        className={cx(s.btnGhost, s.btnSm)}
        disabled={uploading}
        onClick={() => input.current?.click()}
      >
        {icon ? "Change" : "Upload"}
      </button>
      {icon && (
        <button
          type="button"
          className={cx(s.iconBtn, s.iconBtnBare)}
          onClick={() => onChange(null)}
          aria-label={`Remove icon from ${label || "button"}`}
        >
          <X size={15} aria-hidden="true" />
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        className={s.srOnly}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void pick(file);
        }}
      />
      {error && <p className={cx(s.hint, s.err)}>{error}</p>}
    </div>
  );
}

// ─── Colours ─────────────────────────────────────────────────────────────────

const HEX = /^#[0-9a-f]{6}$/i;

/** WCAG contrast ratio between two #rrggbb colours */
export function contrast(a: string, b: string) {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

export function ColorField({
  label,
  value,
  warn,
  onChange,
}: {
  label: string;
  value: string;
  warn: boolean;
  onChange: (v: string) => void;
}) {
  const id = useId();
  const [text, setText] = useState(value);
  // Follow outside changes (a preset, the native picker) while the hex field isn't being typed in
  const [shown, setShown] = useState(value);
  if (value !== shown) {
    setShown(value);
    setText(value);
  }
  const invalid = !HEX.test(text);
  return (
    <div>
      <label className={s.label} htmlFor={id}>
        {label}
      </label>
      <div className={cx(s.colorInput, invalid && s.inputError)}>
        <span className={s.colorSwatch} style={{ background: value }}>
          <input
            type="color"
            value={value}
            aria-label={`${label} colour picker`}
            onChange={(e) => onChange(e.target.value.toLowerCase())}
          />
        </span>
        <input
          id={id}
          value={text}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={invalid}
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setText(v);
            if (HEX.test(v)) onChange(v.toLowerCase());
          }}
          onBlur={() => setText(value)}
        />
      </div>
      {invalid ? (
        <p className={cx(s.hint, s.err)}>Use a hex colour like #ff5a4e.</p>
      ) : (
        warn && <p className={cx(s.hint, s.warn)}>Hard to read on its background.</p>
      )}
    </div>
  );
}

// ─── Profile photo crop ──────────────────────────────────────────────────────

async function cropToBlob(src: string, area: Area): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = src;
  });
  const canvas = document.createElement("canvas");
  canvas.width = area.width;
  canvas.height = area.height;
  canvas.getContext("2d")?.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Crop failed"))), "image/jpeg", 0.9),
  );
}

export function CropDialog({
  src,
  onApply,
  onClose,
}: {
  src: string;
  onApply: (blob: Blob) => void;
  onClose: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const onComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  return (
    <Dialog title="Crop photo" description="Drag to position, and zoom to fit." onClose={onClose}>
      <div className={s.cropArea}>
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onComplete}
        />
      </div>
      <label className={s.label} htmlFor="crop-zoom" style={{ marginTop: 16 }}>
        Zoom
      </label>
      <input
        id="crop-zoom"
        type="range"
        className={s.range}
        min={1}
        max={3}
        step={0.01}
        value={zoom}
        style={{ "--p": `${((zoom - 1) / 2) * 100}%` } as React.CSSProperties}
        onChange={(e) => setZoom(Number(e.target.value))}
      />
      <div className={s.dialogActions}>
        <button type="button" className={s.btnGhost} onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={s.btnLight}
          disabled={!area || busy}
          onClick={async () => {
            if (!area) return;
            setBusy(true);
            try {
              onApply(await cropToBlob(src, area));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy && <Loader2 size={15} className={s.spin} aria-hidden="true" />}
          Use photo
        </button>
      </div>
    </Dialog>
  );
}
