const STEPS = [
  {
    number: "01",
    label: "User Clicks",
    description: "A visitor taps your link in bio and lands on your Ultralink page.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
      </svg>
    ),
  },
  {
    number: "02",
    label: "User Leaves",
    description: "They start to navigate away — closing the tab or hitting back.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
      </svg>
    ),
  },
  {
    number: "03",
    label: "Traffic Recovery",
    description: "A clean, opt-in prompt offers them a second destination — a different offer, product, or channel — before they go.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    highlight: true,
  },
  {
    number: "04",
    label: "Conversion",
    description: "Traffic that would have been lost finds a new action. One page, two chances to convert.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function TrafficRecovery() {
  return (
    <section
      className="py-24 sm:py-32 px-4 sm:px-6"
      aria-labelledby="traffic-recovery-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-gold/20 bg-gold-dim text-xs font-medium tracking-widest uppercase text-gold">
              Agency exclusive
            </div>
            <h2
              id="traffic-recovery-heading"
              className="font-display text-4xl sm:text-5xl font-bold text-text"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Turn exits into conversions.
            </h2>
          </div>
          <p className="text-text-muted max-w-sm text-base leading-relaxed lg:text-right">
            Most visitors who leave are gone forever. Traffic Recovery gives you a
            second chance to capture them — legitimately, without dark patterns.
          </p>
        </div>

        {/* Steps: horizontal flow */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div
            className="absolute top-[40px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent hidden lg:block pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, index) => (
              <div
                key={step.number}
                className={[
                  "relative p-6 rounded-[var(--radius-lg)] border transition-all duration-200",
                  step.highlight
                    ? "bg-gold-dim border-gold/30 shadow-[0_0_40px_rgba(201,168,106,0.1)]"
                    : "bg-surface border-border",
                ].join(" ")}
              >
                {/* Step number chip */}
                <div
                  className={[
                    "inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold tracking-wider mb-5",
                    step.highlight
                      ? "bg-gold text-bg"
                      : "bg-surface-2 text-text-muted border border-border-strong",
                  ].join(" ")}
                >
                  {step.number}
                </div>

                {/* Arrow connector (mobile) */}
                {index < STEPS.length - 1 && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-text-subtle lg:hidden" aria-hidden="true">
                    ↓
                  </div>
                )}

                <div className={step.highlight ? "text-gold" : "text-text-subtle"}>
                  {step.icon}
                </div>
                <h3
                  className={[
                    "text-base font-semibold mt-3 mb-2",
                    step.highlight ? "text-gold" : "text-text",
                  ].join(" ")}
                >
                  {step.label}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
