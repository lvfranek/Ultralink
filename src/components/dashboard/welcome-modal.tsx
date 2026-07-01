"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { WELCOME_VIDEO_ID } from "@/lib/config/help-content";
import { YouTubeThumbnail } from "@/components/youtube-thumbnail";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  displayName?: string | null;
}

export function WelcomeModal({ open, onClose, displayName }: WelcomeModalProps) {
  const [playing, setPlaying] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleClose = useCallback(() => {
    setPlaying(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key !== "Tab" || !cardRef.current) return;
      const focusable = cardRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  if (!open) return null;

  const name = displayName || "there";
  const comingSoon = WELCOME_VIDEO_ID === "PLACEHOLDER";

  const handleExploreHelp = () => {
    handleClose();
    router.push("/help");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.7)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Ultralink"
        className="w-full max-w-[560px] rounded-[20px] p-6 sm:p-8 relative"
        style={{ background: "#141414", border: "1px solid rgba(255,255,255,.08)", animation: "welcome-modal-in 0.18s ease-out" }}
      >
        <style>{`
          @keyframes welcome-modal-in {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        <button
          ref={closeRef}
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-lg cursor-pointer"
          style={{ color: "#6B6B6B" }}
        >
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>

        <Logo iconSize={26} showWordmark={false} onDark href="" />

        <h2 className="mt-5 text-2xl font-bold" style={{ color: "#fff" }}>
          Welcome to Ultralink, {name}.
        </h2>
        <p className="mt-2 text-sm" style={{ color: "#9A9A9A" }}>
          Here&apos;s a quick 2-minute intro to help you get the most out of your account.
        </p>

        <div className="mt-5 w-full aspect-video rounded-[14px] overflow-hidden" style={{ background: "#000" }}>
          {comingSoon ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center px-6" style={{ background: "#1E1E1E" }}>
              <p className="text-sm font-medium" style={{ color: "#fff" }}>Video coming soon.</p>
              <p className="text-xs mt-1" style={{ color: "#6B6B6B" }}>
                In the meantime, check out our Help Center.
              </p>
            </div>
          ) : playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${WELCOME_VIDEO_ID}?rel=0&autoplay=1`}
              title="Welcome to Ultralink"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <YouTubeThumbnail
              youtubeId={WELCOME_VIDEO_ID}
              title="Welcome to Ultralink"
              onPlay={() => setPlaying(true)}
            />
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold rounded-full transition-opacity hover:opacity-85 cursor-pointer"
            style={{ background: "#fff", color: "#000" }}
          >
            Got it, let&apos;s go
          </button>
          <button
            type="button"
            onClick={handleExploreHelp}
            className="text-sm font-medium cursor-pointer"
            style={{ color: "#9A9A9A" }}
          >
            Explore Help Center →
          </button>
        </div>
      </div>
    </div>
  );
}
