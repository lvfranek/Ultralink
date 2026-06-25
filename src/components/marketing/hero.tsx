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
      style={{ background: '#0A0A0A' }}
      className="px-4 sm:px-6"
      aria-label="Hero"
    >
      <div style={{ maxWidth: 1140, margin: '0 auto', paddingTop: 88, paddingBottom: 56 }}>
        {/* White framed card — overflow:visible so the glow is never clipped */}
        <div
          style={{
            position: 'relative',
            background: '#fff',
            color: '#0A0A0A',
            borderRadius: 28,
            border: '1px solid rgba(0,0,0,.06)',
            padding: '80px 32px 72px',
            textAlign: 'center',
            overflow: 'visible',
          }}
        >
          {/* Main headline */}
          <h1
            style={{
              fontWeight: 500,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(38px, 6vw, 62px)',
              lineHeight: 1.05,
              margin: '0 0 20px',
              color: '#0A0A0A',
            }}
          >
            Move your audience anywhere,
            <br />
            safely and instantly.
          </h1>

          {/* Subhead — forced two-line break */}
          <p
            style={{
              color: '#6B6B6B',
              fontSize: 18,
              lineHeight: 1.6,
              margin: '0 auto 38px',
              maxWidth: 620,
            }}
          >
            Made for influencer agencies. One link hub for everything you do.
            <br />
            Fast, beautiful, and engineered to keep your accounts safe.
          </p>

          {/*
            Claim container — gradient border + soft pastel glow.
            isolation:isolate keeps z-index values local.
            overflow:visible on the card means the glow is never cut off.
          */}
          <div
            style={{ position: 'relative', maxWidth: 560, margin: '0 auto 14px', isolation: 'isolate' }}
          >
            {/* Glow */}
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
            {/* Gradient border frame */}
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
                    fontFamily: 'inherit',
                  }}
                >
                  Claim my link →
                </button>
              </form>
            </div>
          </div>

          {/* Micro-copy */}
          <p style={{ color: '#9a9a9a', fontSize: 13, marginTop: 14 }}>
            Free forever, no credit card required.
          </p>

          {/* Trust indicators */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 24,
              marginTop: 30,
              color: '#8a8a8a',
              fontSize: 13,
            }}
          >
            {[
              "No link cloaking",
              "Platform-safe by default",
              "Built-in age gate",
              "Real analytics",
            ].map((item) => (
              <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg viewBox="0 0 12 12" fill="none" style={{ width: 12, height: 12, flexShrink: 0 }} aria-hidden="true">
                  <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
