"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, X } from "lucide-react";
import { getPlatform } from "@/lib/config/socials";
import s from "./app.module.css";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Feeds the pointer position into --x/--y so the card's spotlight follows the cursor. */
export function spotlight(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
}

export function themeVars(theme: [string, string, string]): CSSProperties {
  return { "--a": theme[0], "--b": theme[1], "--c": theme[2] } as CSSProperties;
}

export function initials(name: string) {
  return name
    .replace(/[^\p{L}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function Avatar({
  name,
  size = 32,
  round = false,
  className,
}: {
  name: string;
  size?: number;
  round?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(s.avatar, round && s.avatarRound, className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function RainbowBorder({ className, id, children }: { className?: string; id?: string; children: ReactNode }) {
  return (
    <div id={id} className={cx(s.rainbow, className)}>
      <span className={s.spinner} aria-hidden="true" />
      <div className={s.rainbowInner}>{children}</div>
    </div>
  );
}

export function BrandIcon({ id, size = 16 }: { id: string; size?: number }) {
  const p = getPlatform(id);
  if (!p) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={p.svgPath} fill="currentColor" />
    </svg>
  );
}

// ─── Count-up ────────────────────────────────────────────────────────────────

/** Eases from the previous value to `target` whenever it changes (and from 0 on mount with `fromZero`). */
export function useCountUp(target: number, fromZero = false, duration = 900) {
  const [value, setValue] = useState(fromZero ? 0 : target);
  const from = useRef(fromZero ? 0 : target);

  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    if (prefersReducedMotion()) {
      from.current = target;
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      const v = start + (target - start) * eased;
      from.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

export function Sparkline({
  data,
  className,
  color = "#f7a8c4",
}: {
  data: number[];
  className?: string;
  color?: string;
}) {
  const id = useId();
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * 100, 28 - ((v - min) / (max - min || 1)) * 24]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  return (
    <svg className={cx(s.spark, className)} viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L100,30 L0,30 Z`} fill={`url(#${id}f)`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ─── Segmented control ───────────────────────────────────────────────────────

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: ReactNode; aria?: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  // -1 when the current value isn't one of the options: no thumb then
  const index = options.findIndex((o) => o.value === value);
  const i = Math.max(0, index);
  return (
    <div
      className={s.seg}
      role="radiogroup"
      aria-label={label}
      style={{ "--n": options.length, "--i": i } as CSSProperties}
    >
      <span className={s.segThumb} aria-hidden="true" style={index < 0 ? { opacity: 0 } : undefined} />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          aria-label={o.aria}
          className={cx(s.segBtn, o.value === value && s.segActive)}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Popover ─────────────────────────────────────────────────────────────────

/** Closes on outside click and Escape. */
export function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

/** Native <dialog>: focus trap, Escape and the top layer come for free. Mount it to open it. */
export function Dialog({
  title,
  description,
  onClose,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className={cx(s.dialog, className)}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the <dialog> element itself
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.dialogBody}>
        <button type="button" className={cx(s.iconBtn, s.dialogClose)} onClick={onClose} aria-label="Close">
          <X size={16} aria-hidden="true" />
        </button>
        <h2 id={titleId} className={s.dialogTitle}>
          {title}
        </h2>
        {description && <p className={s.dialogSub}>{description}</p>}
        {children}
      </div>
    </dialog>
  );
}

/** "+12.4%" chip comparing a value with the previous period */
export function Delta({ current, previous, invert = false }: { current: number; previous: number; invert?: boolean }) {
  if (!previous) return <span className={cx(s.chip, s.neutral)}>New</span>;
  const change = ((current - previous) / previous) * 100;
  const good = invert ? change < 0 : change >= 0;
  const Icon = change >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cx(s.chip, good ? s.up : s.down)}>
      <Icon size={12} strokeWidth={2.5} aria-hidden="true" />
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}
