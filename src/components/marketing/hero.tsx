"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const GRADIENT = 'linear-gradient(110deg,#FBC2A4 0%,#F7A8C4 33%,#C9A7F2 66%,#A7C7F7 100%)';

export function Hero() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const slug = username
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 32);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) {
      inputRef.current?.focus();
      return;
    }
    router.push(`/login?username=${encodeURIComponent(slug)}`);
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-4 sm:px-6"
      aria-label="Hero"
    >
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main headline */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[1.05] mb-6 text-text"
          style={{ letterSpacing: "-0.02em" }}
        >
          One link.
          <br />
          Your entire world.
        </h1>

        {/* Subhead */}
        <p className="text-lg sm:text-xl text-text-muted max-w-md mx-auto mb-12 leading-relaxed">
          One link for everything you do. Fast, beautiful, and built to keep your accounts safe.
        </p>

        {/*
          Claim container — two-layer gradient border + soft pastel glow.
          Glow uses z-index:0 (NOT -1) so it renders above the page bg.
          No overflow-hidden on this section or any ancestor.
          isolation:isolate creates a stacking context so z-index values are local.
        */}
        <div
          className="relative w-full mx-auto mb-5"
          style={{ maxWidth: 560, isolation: 'isolate' }}
        >
          {/* Glow: absolute, inset -14px, z-index 0 — visible above page, below frame */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: -14,
              borderRadius: 28,
              background: GRADIENT,
              filter: 'blur(26px)',
              opacity: 0.7,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          {/* Gradient border: gradient bg on OUTER element, white on INNER child */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              borderRadius: 18,
              padding: 1.5,
              background: GRADIENT,
            }}
          >
            <form
              onSubmit={handleClaim}
              aria-label="Claim your username"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#fff',
                borderRadius: 16.5,
                padding: '8px 8px 8px 18px',
              }}
            >
              <span
                style={{
                  color: '#6B6B6B',
                  fontSize: 16,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >
                ultralink.bio/
              </span>
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                maxLength={32}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Your username"
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: 16,
                  color: '#0A0A0A',
                  padding: '8px 4px',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                style={{
                  flexShrink: 0,
                  background: '#0A0A0A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 18px',
                  fontWeight: 500,
                  fontSize: 15,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                Claim my link →
              </button>
            </form>
          </div>
        </div>

        {/* Micro-copy */}
        <p className="text-xs text-text-subtle">
          Free forever, no credit card required.{" "}
          <span className="text-text-muted">Upgrade any time.</span>
        </p>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-text-subtle">
          {[
            "No link cloaking",
            "Platform-safe by default",
            "Built-in age gate",
            "Real analytics",
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-text-muted">
              <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 shrink-0" aria-hidden="true">
                <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
