const STEPS = [
  {
    number: "01",
    label: "User Clicks",
    description: "A visitor taps your link in bio and lands on your Ultralink page.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    highlight: false,
  },
];

export function TrafficRecovery() {
  return (
    <section
      aria-labelledby="win-back-heading"
      style={{ maxWidth: 1140, margin: '0 auto', padding: '72px 24px' }}
    >
      {/* Floating header — centered */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          id="win-back-heading"
          style={{
            fontWeight: 500,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(28px, 4vw, 40px)',
            color: '#ffffff',
            margin: '0 0 10px',
          }}
        >
          Turn exits into conversions.
        </h2>
        <p style={{ color: '#9A9A9A', fontSize: 17, margin: '0 auto', maxWidth: 560, lineHeight: 1.6 }}>
          Most visitors who leave are gone forever. Win-Back gives you a second chance — legitimately, without dark patterns.
        </p>
      </div>

      {/* Steps grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {STEPS.map((step) => (
          <div
            key={step.number}
            style={{
              position: 'relative',
              background: '#1A1A1A',
              border: step.highlight
                ? '1px solid rgba(201,167,242,0.40)'
                : '1px solid rgba(255,255,255,.10)',
              borderRadius: 16,
              padding: 24,
              boxShadow: step.highlight ? '0 2px 16px rgba(201,167,242,0.12)' : 'none',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,.10)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#9A9A9A',
                marginBottom: 20,
              }}
            >
              {step.number}
            </div>
            <div style={{ color: '#9A9A9A', marginBottom: 10 }}>{step.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', margin: '0 0 8px' }}>
              {step.label}
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: '#9A9A9A', margin: 0 }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
