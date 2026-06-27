"use client";

import { useState, type ReactNode } from "react";

export function SettingsCard({
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  title: string;
  summary?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{ background: "#2A2A2A", border: "1px solid rgba(255,255,255,.08)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer transition-colors"
        style={open ? undefined : undefined}
        onMouseEnter={(e) => { if (!open) (e.currentTarget.parentElement as HTMLElement).style.background = "#2E2E2E"; }}
        onMouseLeave={(e) => { (e.currentTarget.parentElement as HTMLElement).style.background = open ? "#2A2A2A" : "#2A2A2A"; }}
      >
        <span className="text-[11px] font-medium uppercase tracking-widest leading-none" style={{ color: "#9A9A9A" }}>{title}</span>
        <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0 ml-2">
          {!open && summary && (
            <span className="text-xs text-text-subtle truncate max-w-[150px]">{summary}</span>
          )}
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`w-3.5 h-3.5 text-text-subtle transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
          >
            <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-4 pt-3 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function FieldRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-3 py-2.5 min-h-[44px] [&:not(:last-child)]:border-b"
      style={{ borderColor: "rgba(255,255,255,.06)" }}
    >
      <span className="text-sm text-text-muted flex-shrink-0 min-w-[72px]">{label}</span>
      <div className="flex-1 flex items-center justify-end gap-2">{children}</div>
    </div>
  );
}
