"use client";

import { useState, useMemo } from "react";
import { COUNTRY_NAMES, flagEmoji } from "@/lib/countries";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";

interface CountryBlockingControlProps {
  value: string[];
  onChange: (v: string[]) => void;
  isPro: boolean;
}

const SORTED_COUNTRIES = Object.entries(COUNTRY_NAMES).sort((a, b) => a[1].localeCompare(b[1]));

function countrySummary(codes: string[]): string {
  if (codes.length === 0) return "None";
  if (codes.length === 1) return "1 country";
  return `${codes.length} countries`;
}

export function CountryBlockingControl({ value, onChange, isPro }: CountryBlockingControlProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return SORTED_COUNTRIES;
    return SORTED_COUNTRIES.filter(([code, name]) => name.toLowerCase().includes(q) || code.toLowerCase().includes(q));
  }, [search]);

  const toggle = (code: string) => {
    onChange(value.includes(code) ? value.filter((c) => c !== code) : [...value, code]);
  };

  const remove = (code: string) => onChange(value.filter((c) => c !== code));

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
            <p className="text-sm font-medium text-text">Country blocking</p>
            <p className="text-xs text-text-muted mt-0.5">Block visitors from selected countries.</p>
          </div>
          <span className="ml-3 flex-shrink-0 text-[10px] px-1.5 py-0.5 bg-gold-dim text-gold border border-gold/20 rounded font-semibold uppercase tracking-wider">
            PRO
          </span>
        </div>
        <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      </>
    );
  }

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
      <button
        type="button"
        className="w-full flex items-start justify-between py-2.5 cursor-pointer text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div>
          <p className="text-sm font-medium text-text">Country blocking</p>
          <p className="text-xs text-text-muted mt-0.5">Block visitors from selected countries.</p>
        </div>
        <div className="flex items-center gap-1.5 ml-3 flex-shrink-0 mt-0.5">
          <span className="text-xs" style={{ color: "#9A9A9A" }}>
            {countrySummary(value)}
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
        <div className="pb-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search countries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-2 bg-surface-2 border border-border-strong rounded-[var(--radius)] px-3 py-2 text-xs text-text placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-white/20"
          />

          {/* Selected chips */}
          {value.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {value.map((code) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
                  style={{ background: "rgba(255,255,255,.08)", color: "#cccccc" }}
                >
                  {flagEmoji(code)} {code}
                  <button
                    type="button"
                    onClick={() => remove(code)}
                    className="ml-0.5 leading-none cursor-pointer hover:opacity-80"
                    aria-label={`Remove ${COUNTRY_NAMES[code] ?? code}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Country list */}
          <div
            className="overflow-y-auto rounded-[var(--radius)]"
            style={{ maxHeight: 200, background: "#1E1E1E", border: "1px solid rgba(255,255,255,.06)" }}
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-xs text-center" style={{ color: "#6B6B6B" }}>
                No results
              </p>
            ) : (
              filtered.map(([code, name]) => (
                <label
                  key={code}
                  className="flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors hover:bg-white/5"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(code)}
                    onChange={() => toggle(code)}
                    className="rounded accent-white flex-shrink-0"
                  />
                  <span className="text-xs flex-shrink-0">{flagEmoji(code)}</span>
                  <span className="text-xs text-text flex-1 min-w-0 truncate">{name}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: "#6B6B6B" }}>
                    {code}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
