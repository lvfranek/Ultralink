import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics — Dashboard",
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  return <ComingSoon title="Analytics" description="Click tracking, referrer data, and geo insights are coming in Phase 3." />;
}

function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-text mb-2">{title}</h1>
      <div className="mt-12 flex flex-col items-center text-center">
        <div
          className="w-16 h-16 rounded-[var(--radius-lg)] flex items-center justify-center mb-5"
          style={{ background: "rgba(201,168,106,0.06)", border: "1px solid rgba(201,168,106,0.12)" }}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-gold opacity-60" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M3 20l4.5-7 4 4 4-8 4.5 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full border border-gold/20 bg-gold-dim text-xs font-medium tracking-widest uppercase text-gold">
          Coming soon
        </span>
        <p className="text-sm text-text-muted max-w-xs">{description}</p>
      </div>
    </div>
  );
}
