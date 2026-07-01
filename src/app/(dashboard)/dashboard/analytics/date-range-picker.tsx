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
}

export function CustomRangePopover({ value, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(value);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function checkWidth() { setNarrow(window.innerWidth < 640); }
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPopoverStyle({
      position: "fixed",
      top: rect.bottom + 6,
      right: Math.max(8, window.innerWidth - rect.right),
      zIndex: 9999,
    });
  }, []);

  useLayoutEffect(() => {
    if (open) {
      setDraft(value);
      updatePosition();
    }
  }, [open, value, updatePosition]);

  function handleApply() {
    if (draft?.from && draft?.to) {
      onApply(draft);
      setOpen(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer"
        style={{ background: "#ffffff", color: "#000000" }}
      >
        Custom
      </button>

      {open && mounted && createPortal(
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setOpen(false)} />
          <div
            style={{
              ...popoverStyle,
              background: "#141414",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 14,
              padding: "1rem",
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
                onClick={() => setOpen(false)}
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
