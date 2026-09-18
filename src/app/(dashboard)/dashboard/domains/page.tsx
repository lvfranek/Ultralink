import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ultralink Domains",
  robots: { index: false, follow: false },
};

export default function DomainsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-text mb-2">Domains</h1>
      <div className="mt-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-[var(--radius-lg)] flex items-center justify-center mb-5 bg-surface-2 border border-border">
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 text-text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path
              d="M12 3c-2.5 3-3.5 5.5-3.5 9s1 6 3.5 9M12 3c2.5 3 3.5 5.5 3.5 9s-1 6-3.5 9M3 12h18"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full border border-border-strong bg-surface-2 text-xs font-medium tracking-widest uppercase text-text-muted">
          Coming soon
        </span>
        <p className="text-sm text-text-muted max-w-xs">
          Custom domain support is coming in Phase 5, together with per-link domains for Agency plans.
        </p>
      </div>
    </div>
  );
}
