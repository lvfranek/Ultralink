"use client";

import type { Page } from "@/lib/supabase/types";

interface AdvancedTabProps {
  page: Pick<Page, "age_gate_enabled">;
  onChange: (patch: Partial<Pick<Page, "age_gate_enabled">>) => void;
}

function ComingSoonBadge() {
  return (
    <span className="text-[10px] px-1.5 py-0.5 bg-surface-2 text-text-subtle border border-border-strong rounded font-semibold uppercase tracking-wider">
      Phase 5
    </span>
  );
}

export function AdvancedTab({ page, onChange }: AdvancedTabProps) {
  return (
    <div className="space-y-4 py-2">
      {/* Age gate */}
      <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-[var(--radius)]">
        <div>
          <p className="text-sm font-medium text-text">18+ Age gate</p>
          <p className="text-xs text-text-muted mt-0.5">
            Shows a full-screen age confirmation before revealing your page
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={page.age_gate_enabled}
          onClick={() => onChange({ age_gate_enabled: !page.age_gate_enabled })}
          className={[
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer flex-shrink-0",
            page.age_gate_enabled ? "bg-emerald-500" : "bg-surface-2 border border-border-strong",
          ].join(" ")}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${page.age_gate_enabled ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      {page.age_gate_enabled && (
        <div className="px-4 py-3 bg-gold-dim border border-gold/20 rounded-[var(--radius)] text-xs text-text-muted leading-relaxed">
          When enabled, visitors see a consent screen before accessing your page.
          The confirmation is remembered for their browser session — they won&apos;t be
          asked again on repeat visits within the same session.
        </div>
      )}

      {/* Coming soon stubs */}
      <div className="mt-6 space-y-3">
        <p className="text-xs font-medium text-text-subtle uppercase tracking-widest">Coming in Phase 5</p>

        {[
          {
            label: "Custom Domain",
            description: "Point your own domain (e.g. links.yourbrand.com) to this page.",
          },
          {
            label: "Geo-Blocking",
            description: "Restrict access to specific countries or regions.",
          },
          {
            label: "Win-Back",
            description: "Show a prompt to visitors who start to leave, offering a second destination.",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between p-4 bg-surface border border-border rounded-[var(--radius)] opacity-60"
          >
            <div>
              <p className="text-sm font-medium text-text flex items-center gap-2">
                {item.label}
                <ComingSoonBadge />
              </p>
              <p className="text-xs text-text-muted mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
