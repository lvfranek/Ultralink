"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-20 px-4 sm:px-6"
      aria-label="Hero"
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(201,168,106,0.08)_0%,transparent_65%)]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(201,168,106,0.04)_0%,transparent_65%)]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,243,239,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,243,239,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-gold/20 bg-gold-dim text-xs font-medium tracking-widest uppercase text-gold">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          Premium link-in-bio platform
        </div>

        {/* Main headline */}
        <h1
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-6"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          <span className="text-text">One link.</span>
          <br />
          <span className="text-gold-gradient">Your entire world.</span>
        </h1>

        {/* Subhead */}
        <p className="text-lg sm:text-xl text-text-muted max-w-xl mx-auto mb-12 leading-relaxed">
          The premium link-in-bio for creators and agencies who refuse to
          settle. Fast pages, deep analytics, and a platform that keeps
          your accounts safe — by design.
        </p>

        {/* Username claim form */}
        <form
          onSubmit={handleClaim}
          className="flex flex-col sm:flex-row items-center gap-0 max-w-xl mx-auto mb-5"
          aria-label="Claim your username"
        >
          <div className="flex w-full bg-surface border border-border-strong rounded-[var(--radius)] sm:rounded-r-none focus-within:border-gold/40 focus-within:ring-2 focus-within:ring-gold/20 transition-all duration-150 overflow-hidden">
            {/* Static prefix */}
            <span className="flex items-center pl-4 pr-1 text-sm text-text-subtle whitespace-nowrap select-none flex-shrink-0">
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
              spellCheck="false"
              aria-label="Your username"
              className="flex-1 min-w-0 bg-transparent py-3.5 pr-4 text-sm text-text placeholder-text-subtle focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center mt-2 sm:mt-0 px-6 py-3.5 text-sm font-semibold bg-gold text-bg rounded-[var(--radius)] sm:rounded-l-none hover:bg-gold-bright transition-colors duration-150 active:scale-[0.98] shadow-[0_1px_20px_rgba(201,168,106,0.3)] whitespace-nowrap flex-shrink-0"
          >
            Claim my link →
          </button>
        </form>

        {/* Social proof / micro-copy */}
        <p className="text-xs text-text-subtle">
          Free forever, no credit card required.{" "}
          <span className="text-text-muted">Upgrade any time.</span>
        </p>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-xs text-text-subtle">
          {[
            "✓ No link cloaking",
            "✓ Platform-safe by default",
            "✓ Built-in age gate",
            "✓ Real analytics",
          ].map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 text-text-muted"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
