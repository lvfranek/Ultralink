"use client";

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";

export type RangeKey = "7d" | "30d" | "90d" | "thisMonth" | "lastMonth" | "custom";

export const RANGE_OPTIONS: { label: string; value: RangeKey }[] = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "This month", value: "thisMonth" },
  { label: "Last month", value: "lastMonth" },
  { label: "Custom", value: "custom" },
];

interface Props {
  value: DateRange | undefined;
  onApply: (range: DateRange) => void;
  defaultOpen?: boolean;
  onClose?: () => void;
}

export function CustomRangePopover({ value, onApply, defaultOpen = false, onClose }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState<DateRange | undefined>(value);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
    if (onClose) onClose();
  }, [onClose]);

  const updatePosition = useCallback(() => {
    if (narrow) {
      setPopoverStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
      });
      return;
    }

    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverW = 540; // Approx widths for 2 months + padding

    // Align right edge first, clamped to screen edges
    let left = rect.right - popoverW;
    left = Math.max(8, Math.min(left, window.innerWidth - popoverW - 8));

    setPopoverStyle({
      position: "fixed",
      top: rect.bottom + 6,
      left,
      zIndex: 9999,
    });
  }, [narrow]);

  useEffect(() => {
    function handleResize() {
      setNarrow(window.innerWidth < 640);
      if (open) updatePosition();
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [open, updatePosition]);

  useLayoutEffect(() => {
    if (open) {
      setDraft(value);
      updatePosition();
    }
  }, [open, value, updatePosition]);

  function handleApply() {
    if (draft?.from && draft?.to) {
      onApply(draft);
      handleClose();
    }
  }

  return (
    <div className="relative inline-block">
      {!defaultOpen && (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer"
          style={{ background: "#ffffff", color: "#000000" }}
        >
          Custom
        </button>
      )}

      {open && mounted && createPortal(
        <>
          <div
            className="fixed inset-0"
            style={{
              zIndex: 9998,
              background: narrow ? "rgba(0,0,0,0.6)" : "transparent",
              backdropFilter: narrow ? "blur(4px)" : "none",
              transition: "all 0.2s"
            }}
            onClick={handleClose}
          />
          <div
            style={{
              ...popoverStyle,
              background: "#141414",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 14,
              padding: narrow ? "0.75rem" : "1rem",
              boxShadow: "0 12px 40px rgba(0,0,0,.6)",
            }}
            className="ul-daypicker"
          >
            <DayPicker
              mode="range"
              numberOfMonths={narrow ? 1 : 2}
              selected={draft}
              onSelect={setDraft}
              defaultMonth={draft?.from ?? new Date()}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 text-xs font-medium border rounded-full transition-colors cursor-pointer"
                style={{ color: "#9A9A9A", borderColor: "rgba(255,255,255,.14)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={!draft?.from || !draft?.to}
                className="px-3 py-1.5 text-xs font-semibold rounded-full transition-all disabled:opacity-40 cursor-pointer"
                style={{ background: "#ffffff", color: "#000000" }}
              >
                Apply
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
