"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "ultralink_age_confirmed";

interface AgeGateProps {
  slug: string;
}

export function AgeGate({ slug }: AgeGateProps) {
  const [confirmed, setConfirmed] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`${SESSION_KEY}_${slug}`);
    setConfirmed(stored === "yes");
  }, [slug]);

  function confirm() {
    sessionStorage.setItem(`${SESSION_KEY}_${slug}`, "yes");
    setConfirmed(true);
  }

  function leave() {
    window.location.href = "about:blank";
  }

  // null = not yet checked (avoid flash)
  if (confirmed === null || confirmed === true) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div className="w-full max-w-sm bg-surface border border-border-strong rounded-[var(--radius-lg)] p-8 text-center shadow-[0_0_60px_rgba(0,0,0,0.6)]">
        <div className="w-12 h-12 rounded-full bg-gold-dim border border-gold/30 flex items-center justify-center mx-auto mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-gold">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h2 id="age-gate-title" className="text-lg font-bold text-text mb-2">
          Age verification required
        </h2>
        <p className="text-sm text-text-muted mb-8 leading-relaxed">
          This page may contain adult content. You must be 18 or older to continue.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={confirm}
            className="w-full py-3 rounded-[var(--radius)] bg-gold text-bg text-sm font-semibold hover:bg-gold-bright transition-colors"
          >
            I am 18 or older — Enter
          </button>
          <button
            type="button"
            onClick={leave}
            className="w-full py-3 rounded-[var(--radius)] border border-border-strong text-text-muted text-sm hover:bg-surface-2 transition-colors"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
