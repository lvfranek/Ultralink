"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { submitFeedback } from "@/app/actions/feedback";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  defaultName: string;
  defaultEmail: string;
}

type FeedbackType = "bug" | "feature";

const PLACEHOLDERS: Record<FeedbackType, string> = {
  bug: "What happened? What did you expect to happen? Include steps to reproduce if you can.",
  feature: "What would you like Ultralink to do? Why would it help you?",
};

export function FeedbackModal({ open, onClose, defaultName, defaultEmail }: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>("bug");
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Refill name/email with the defaults each time the modal opens
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName(defaultName);
      setEmail(defaultEmail);
    }
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleClose = useCallback(() => {
    onClose();
    setType("bug");
    setMessage("");
    setError(null);
    setSent(false);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key !== "Tab" || !cardRef.current) return;
      const focusable = cardRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])'
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

  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(handleClose, 3000);
    return () => clearTimeout(t);
  }, [sent, handleClose]);

  if (!open) return null;

  const messageValid = message.trim().length >= 10;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = messageValid && emailValid && name.trim().length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("type", type);
    formData.set("name", name.trim());
    formData.set("email", email.trim());
    formData.set("message", message.trim());
    formData.set("pageUrl", window.location.href);

    const result = await submitFeedback(formData);
    setSubmitting(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    setSent(true);
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
        aria-label="Send feedback"
        className="w-full max-w-[480px] rounded-[20px] p-6 sm:p-8 relative"
        style={{ background: "#141414", border: "1px solid rgba(255,255,255,.08)", animation: "feedback-modal-in 0.18s ease-out" }}
      >
        <style>{`
          @keyframes feedback-modal-in {
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

        {sent ? (
          <div className="py-6 text-center">
            <h2 className="text-2xl font-bold" style={{ color: "#fff" }}>Thanks — we got it.</h2>
            <p className="mt-2 text-sm" style={{ color: "#9A9A9A" }}>
              We read every message and reply within a few days.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 px-5 py-2.5 text-sm font-semibold rounded-full transition-opacity hover:opacity-85 cursor-pointer"
              style={{ background: "#fff", color: "#000" }}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold" style={{ color: "#fff" }}>Send us feedback.</h2>
            <p className="mt-2 text-sm" style={{ color: "#9A9A9A" }}>
              Report a bug or request a feature. We read every message.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div
                className="flex p-1 w-full"
                style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)", borderRadius: 9999 }}
              >
                {(["bug", "feature"] as FeedbackType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className="flex-1 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer"
                    style={{
                      borderRadius: 9999,
                      background: type === t ? "#ffffff" : "transparent",
                      color: type === t ? "#000000" : "#9A9A9A",
                    }}
                  >
                    {t === "bug" ? "Bug" : "Feature request"}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-medium" style={{ color: "#9A9A9A" }}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full px-3.5 py-2.5 rounded-[10px] text-sm outline-none"
                  style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)", color: "#fff" }}
                />
              </div>

              <div>
                <label className="text-xs font-medium" style={{ color: "#9A9A9A" }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full px-3.5 py-2.5 rounded-[10px] text-sm outline-none"
                  style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)", color: "#fff" }}
                />
                {!emailValid && email.length > 0 && (
                  <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>Enter a valid email.</p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium" style={{ color: "#9A9A9A" }}>Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={PLACEHOLDERS[type]}
                  required
                  className="mt-1 w-full px-3.5 py-2.5 rounded-[10px] text-sm outline-none resize-none"
                  style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)", color: "#fff", minHeight: 140 }}
                />
                {!messageValid && message.length > 0 && (
                  <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>Message must be at least 10 characters.</p>
                )}
              </div>

              {error && (
                <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="px-5 py-2.5 text-sm font-semibold rounded-full transition-opacity hover:opacity-85 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "#fff", color: "#000" }}
                >
                  {submitting ? "Sending..." : "Send feedback"}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-sm font-medium cursor-pointer"
                  style={{ color: "#9A9A9A" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
