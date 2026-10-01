"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import s from "./landing.module.css";

export const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Staggers a [data-reveal] element's entrance by `ms`. */
export function delay(ms: number): CSSProperties {
  return { "--d": `${ms}ms` } as CSSProperties;
}

/** Fades every [data-reveal] element in once it scrolls into view. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add(s.in);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Feeds the pointer position into --x/--y so the card's spotlight follows the cursor. */
export function spotlight(e: React.PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
}

export function SoonBadge() {
  return <span className={s.soon}>Coming soon</span>;
}

// ─── Claim field ─────────────────────────────────────────────────────────────

export type SlugState = "idle" | "checking" | "available" | "unavailable";

export interface SlugCheck {
  username: string;
  state: SlugState;
  /** Why the name can't be claimed (taken, invalid, rate-limited) */
  error: string | null;
}

/**
 * Username field with the spinning rainbow border. Both instances on the page
 * share one SlugCheck, so typing in either updates the other and the phone preview.
 */
export function Claim({
  id,
  check,
  onChange,
  onClaim,
}: {
  id: string;
  check: SlugCheck;
  onChange: (raw: string) => void;
  onClaim: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!check.username) {
      inputRef.current?.focus();
      return;
    }
    if (check.state !== "available") {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onClaim();
  };

  return (
    <div className={s.claimBlock}>
      <div className={cx(s.claimWrap, shake && s.shake)}>
        <div className={s.claimGlow} aria-hidden="true">
          <span className={s.spinner} />
        </div>
        <form className={s.claim} onSubmit={handleSubmit} aria-label="Claim your username">
          <span className={s.spinner} aria-hidden="true" />
          <div className={s.claimInner}>
            <label htmlFor={id} className={s.claimPrefix}>
              ultralink.bio/
            </label>
            <div className={s.claimField}>
              <input
                ref={inputRef}
                id={id}
                value={check.username}
                onChange={(e) => onChange(e.target.value)}
                placeholder="yourname"
                maxLength={32}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-describedby={`${id}-status`}
                className={s.claimInput}
              />
              {check.state === "checking" && <span className={s.claimSpinner} aria-hidden="true" />}
              {check.state === "available" && (
                <Check size={16} strokeWidth={2.5} className={s.claimOk} aria-hidden="true" />
              )}
              {check.state === "unavailable" && (
                <X size={16} strokeWidth={2.5} className={s.claimBad} aria-hidden="true" />
              )}
            </div>
            <button type="submit" className={s.btnLight}>
              Claim my link <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
      <p id={`${id}-status`} className={s.claimMsg} aria-live="polite">
        {check.state === "unavailable" ? check.error : ""}
      </p>
    </div>
  );
}
