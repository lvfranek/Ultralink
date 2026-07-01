"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { WinBack, PageLink } from "@/lib/supabase/types";
import { resolveTheme, fontVar, cornerRadius, resolveLinkStyle, DEFAULT_LINK_STYLE } from "@/lib/config/theme";
import type { Theme } from "@/lib/config/theme";
import { isAdultConfirmed, showAdultGate } from "./adult-gate";

interface WinBackOverlayProps {
  pageId: string;
  winBack: WinBack;
  rawTheme: Record<string, unknown> | null;
  avatarUrl: string | null;
  title: string;
  firstLink: PageLink | null;
}

function beacon(pageId: string, kind: "shown" | "click") {
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(
      `/api/track/winback?page_id=${encodeURIComponent(pageId)}&kind=${kind}`
    );
  }
}

export function WinBackOverlay({
  pageId,
  winBack,
  rawTheme,
  avatarUrl,
  title,
  firstLink,
}: WinBackOverlayProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const prevFocusRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const theme: Theme = resolveTheme(rawTheme);
  const ls = firstLink ? resolveLinkStyle(firstLink) : DEFAULT_LINK_STYLE;
  const btnRadius = cornerRadius(ls.corner);
  const titleFont = fontVar(theme.fonts.title);
  const nameColor = theme.colors.name;
  const cardBg = theme.pageBg.type === "image" ? "#0A0A0B" : theme.pageBg.value;

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // Fade-in animation: tick to mounted after a frame
  useEffect(() => {
    if (!open) {
      setMounted(false);
      return;
    }
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const trigger = useCallback(() => {
    prevFocusRef.current = document.activeElement as HTMLElement;
    setOpen(true);
    beacon(pageId, "shown");
  }, [pageId]);

  const dismiss = useCallback(() => {
    setOpen(false);
    prevFocusRef.current?.focus();
  }, []);

  // Exit-intent detection
  useEffect(() => {
    if (open) return;

    const isMobile =
      window.innerWidth < 768 || navigator.maxTouchPoints > 0;

    if (isMobile) {
      const handleVisibility = () => {
        if (document.visibilityState === "hidden") {
          trigger();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);
      return () =>
        document.removeEventListener("visibilitychange", handleVisibility);
    } else {
      const handleMouseOut = (e: MouseEvent) => {
        if (e.clientY <= 0 && !e.relatedTarget) {
          trigger();
        }
      };
      document.addEventListener("mouseout", handleMouseOut);
      return () => document.removeEventListener("mouseout", handleMouseOut);
    }
  }, [open, trigger]);

  // Focus management: move focus into card when opened
  useEffect(() => {
    if (!open || !cardRef.current) return;
    const first = cardRef.current.querySelector<HTMLElement>(
      "a[href], button:not([disabled])"
    );
    first?.focus();
  }, [open]);

  // Keyboard: Escape + focus trap
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;

      const focusable = Array.from(
        cardRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])"
        )
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, dismiss]);

  if (!open) return null;

  const transition = prefersReducedMotion
    ? "none"
    : "opacity 180ms ease, transform 180ms ease";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 9999,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        opacity: mounted ? 1 : 0,
        transition: prefersReducedMotion ? "none" : "opacity 180ms ease",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
      aria-modal="true"
      role="dialog"
      aria-label="Before you go"
    >
      <div
        ref={cardRef}
        className="w-full flex flex-col items-center text-center"
        style={{
          maxWidth: 420,
          padding: "2rem 1.75rem",
          background: cardBg,
          borderRadius: 24,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.1)",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "scale(1)" : "scale(0.96)",
          transition,
        }}
      >
        {/* Avatar */}
        <div className="mb-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={title}
              className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: "#ffffff", color: "#0A0A0B" }}
              aria-hidden="true"
            >
              {(title || "?").charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Headline */}
        <p
          className="text-lg font-bold leading-snug mb-6"
          style={{ color: nameColor, fontFamily: titleFont }}
        >
          {winBack.headline}
        </p>

        {/* CTA button */}
        <a
          href={winBack.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center font-semibold text-sm py-3.5 mb-3 transition-opacity hover:opacity-85"
          style={{
            background: ls.fillValue,
            color: ls.textColor,
            borderRadius: btnRadius,
          }}
          onClick={(e) => {
            if (!winBack.age_gate) {
              beacon(pageId, "click");
              return;
            }
            e.preventDefault();
            if (isAdultConfirmed()) {
              beacon(pageId, "click");
              window.open(winBack.url, "_blank", "noopener,noreferrer");
              return;
            }
            showAdultGate(() => {
              beacon(pageId, "click");
              window.open(winBack.url, "_blank", "noopener,noreferrer");
            });
          }}
        >
          Yes, show me →
        </a>

        {/* Dismiss */}
        <button
          type="button"
          onClick={dismiss}
          className="text-sm transition-opacity hover:opacity-70 cursor-pointer"
          style={{ color: nameColor, opacity: 0.45 }}
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
