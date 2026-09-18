"use client";

import { useState } from "react";
import type { PageLink, WinBack } from "@/lib/supabase/types";
import type { Theme } from "@/lib/config/theme";
import { isValidUrl, normalizeUrl } from "@/lib/url";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";
import { WinBackDialog } from "@/components/public/win-back-overlay";

interface WinBackControlProps {
  value: WinBack;
  onChange: (v: WinBack) => void;
  isPro: boolean;
  /** Page data the popup preview is styled from */
  theme: Theme;
  avatarUrl: string | null;
  title: string;
  firstLink: PageLink | null;
}

function Toggle({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={[
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 cursor-pointer flex-shrink-0",
        checked ? "bg-emerald-500" : "bg-surface-2 border border-border-strong",
      ].join(" ")}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

function rowSummary(value: WinBack): string {
  if (!value.enabled) return "Off";
  if (value.headline) {
    return value.headline.length > 32 ? value.headline.slice(0, 32) + "…" : value.headline;
  }
  return "On";
}

export function WinBackControl({ value, onChange, isPro, theme, avatarUrl, title, firstLink }: WinBackControlProps) {
  const [expanded, setExpanded] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!isPro) {
    return (
      <>
        <div
          role="button"
          tabIndex={0}
          className="flex items-start justify-between py-2.5 cursor-pointer"
          style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
          onClick={() => setUpgradeOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setUpgradeOpen(true);
          }}
        >
          <div>
            <p className="text-sm font-medium text-text">Win-Back</p>
            <p className="text-xs text-text-muted mt-0.5">Recover visitors who try to leave.</p>
          </div>
          <span className="ml-3 flex-shrink-0 text-[10px] px-1.5 py-0.5 bg-gold-dim text-gold border border-gold/20 rounded font-semibold uppercase tracking-wider">
            PRO
          </span>
        </div>
        <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      </>
    );
  }

  const charCount = value.headline.length;
  // Same condition as the live page: the popup only appears once it has a link.
  // Saving adds https:// to bare domains, so the preview does too.
  const previewUrl = value.url.trim() ? normalizeUrl(value.url) : "";
  const canPreview = value.enabled && isValidUrl(previewUrl);

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
      <button
        type="button"
        className="w-full flex items-start justify-between py-2.5 cursor-pointer text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div>
          <p className="text-sm font-medium text-text">Win-Back</p>
          <p className="text-xs text-text-muted mt-0.5">Recover visitors who try to leave.</p>
        </div>
        <div className="flex items-center gap-1.5 ml-3 flex-shrink-0 mt-0.5">
          <span className="text-xs" style={{ color: "#9A9A9A" }}>
            {rowSummary(value)}
          </span>
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            style={{ color: "#9A9A9A" }}
          >
            <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="pb-3 space-y-3">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-text">Enable Win-Back</span>
            <Toggle checked={value.enabled} onToggle={() => onChange({ ...value, enabled: !value.enabled })} />
          </div>

          {/* Headline */}
          <div>
            <div className="relative">
              <input
                type="text"
                value={value.headline}
                onChange={(e) => onChange({ ...value, headline: e.target.value.slice(0, 80) })}
                placeholder="Wait! Check out my newest video first."
                disabled={!value.enabled}
                maxLength={80}
                className="w-full bg-surface-2 border border-border-strong text-text rounded-[var(--radius)] px-3 py-2 text-xs placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-40"
              />
              {charCount >= 70 && (
                <span
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]"
                  style={{ color: charCount >= 80 ? "#ef4444" : "#6B6B6B" }}
                >
                  {charCount}/80
                </span>
              )}
            </div>
          </div>

          {/* Destination URL */}
          <div>
            <input
              type="url"
              value={value.url}
              onChange={(e) => onChange({ ...value, url: e.target.value })}
              placeholder="https://…"
              disabled={!value.enabled}
              className="w-full bg-surface-2 border border-border-strong text-text rounded-[var(--radius)] px-3 py-2 text-xs placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-40"
            />
          </div>

          {/* 18+ gate toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text">Show 18+ confirmation before opening</p>
              <p className="text-xs text-text-subtle mt-0.5">Visitor must confirm age before the Win-Back link opens</p>
            </div>
            <Toggle checked={!!value.age_gate} onToggle={() => onChange({ ...value, age_gate: !value.age_gate })} />
          </div>

          {/* Preview — opens the exact popup visitors see */}
          <div>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              disabled={!canPreview}
              className="w-full flex items-center justify-center gap-1.5 bg-surface-2 border border-border-strong text-text rounded-[var(--radius)] px-3 py-2 text-xs font-medium cursor-pointer transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-2"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-3.5 h-3.5"
                aria-hidden
              >
                <path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8s-2.4 4.5-6.5 4.5S1.5 8 1.5 8z" strokeLinejoin="round" />
                <circle cx="8" cy="8" r="2" />
              </svg>
              Preview popup
            </button>
            {!canPreview && value.enabled && (
              <p className="text-xs text-text-subtle mt-1.5">Add a valid link to preview the popup.</p>
            )}
          </div>
        </div>
      )}

      {previewOpen && (
        <WinBackDialog
          winBack={{ ...value, url: previewUrl }}
          theme={theme}
          avatarUrl={avatarUrl}
          title={title}
          firstLink={firstLink}
          onDismiss={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
