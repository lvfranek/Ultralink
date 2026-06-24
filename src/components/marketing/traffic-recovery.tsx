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
    highlight: false,
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
    highlight: false,
  },
  {
    number: "03",
    label: "Win-Back",
    description: "A clean prompt offers them a second destination — a different offer, product, or channel — before they go.",
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
    highlight: false,
  },
];

export function TrafficRecovery() {
  return (
    <section
      className="px-6"
      aria-labelledby="win-back-heading"
    >
      <div
        className="px-8 sm:px-12 py-12 sm:py-14"
        style={{
          maxWidth: 1100,
          margin: '40px auto',
          background: '#FFFFFF',
          border: '1px solid #E4E4E7',
          borderRadius: 24,
          boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 10px 30px -18px rgba(0,0,0,.12)',
        }}
      >
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-border-strong bg-surface-2 text-xs font-medium text-text-muted">
              For agencies
            </div>
            <h2
              id="win-back-heading"
              className="text-4xl sm:text-5xl font-black text-text tracking-tight"
            >
              Turn exits into conversions.
            </h2>
          </div>
          <p className="text-text-muted max-w-sm text-base leading-relaxed lg:text-right">
            Most visitors who leave are gone forever. Win-Back gives you a
            second chance — legitimately, without dark patterns.
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
                    ? "bg-white border-[#C9A7F2] shadow-[0_2px_16px_rgba(201,167,242,0.18)]"
                    : "bg-white border-[#E4E4E7] shadow-[0_2px_16px_rgba(0,0,0,0.05)]",
                ].join(" ")}
              >
                {/* Step number chip */}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold tracking-wider mb-5 bg-surface-2 text-text-muted border border-border-strong">
                  {step.number}
                </div>

                {/* Arrow connector (mobile) */}
                {index < STEPS.length - 1 && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 lg:hidden text-text-subtle" aria-hidden="true">
                    ↓
                  </div>
                )}

                <div className="text-text-muted">{step.icon}</div>
                <h3 className="text-base font-semibold mt-3 mb-2 text-text">
                  {step.label}
                </h3>
                <p className="text-sm leading-relaxed text-text-muted">
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
