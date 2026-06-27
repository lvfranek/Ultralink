const ITEMS = [
  {
    label: "Platform-safe",
    good: true,
    desc: "Crawlers and users always see the same destination.",
  },
  {
    label: "Link cloaking",
    good: false,
    desc: "Shows platforms one URL, sends users to another. Violates ToS — permanent ban.",
  },
  {
    label: "Honest redirects",
    good: true,
    desc: "No deception, no risk. Your account stays alive.",
  },
  {
    label: "Compliant 18+ gate",
    good: true,
    desc: "Age-restrict content correctly — no ToS violations.",
  },
];

export function NoCloaking() {
  return (
    <section
      aria-labelledby="no-cloaking-heading"
      style={{ maxWidth: 1140, margin: '0 auto', padding: '72px 24px' }}
    >
      {/* Floating heading — matches Features / Pricing pattern */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          id="no-cloaking-heading"
          style={{
            fontWeight: 500,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(28px, 4vw, 40px)',
            color: '#ffffff',
            margin: '0 0 10px',
          }}
        >
          We don&apos;t cloak your links.
        </h2>
        <p style={{ color: '#9A9A9A', fontSize: 17, margin: '0 auto', maxWidth: 600 }}>
          Your account stays alive because we do redirects the honest way.
        </p>
      </div>

      {/* White card — same language as hero */}
      <div
        style={{
          background: '#fff',
          color: '#0A0A0A',
          borderRadius: 28,
          border: '1px solid rgba(0,0,0,.06)',
          padding: 'clamp(36px, 5vw, 56px) clamp(28px, 5vw, 56px)',
          overflow: 'visible',
        }}
      >
        {/* Two-column content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 40,
            alignItems: 'start',
          }}
        >
          {/* Left: comparison items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ITEMS.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: item.good ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${item.good ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    marginTop: 1,
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: item.good ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: item.good ? '#0f7b5c' : '#b91c1c',
                  }}
                >
                  {item.good ? '✓' : '✗'}
                </span>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: item.good ? '#0f7b5c' : '#b91c1c',
                      margin: '0 0 2px',
                    }}
                  >
                    {item.label}
                  </p>
                  <p style={{ fontSize: 13, color: '#6B6B6B', margin: 0, lineHeight: 1.55 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: copy */}
          <div style={{ color: '#4A4A4A', lineHeight: 1.8, fontSize: 16 }}>
            <p style={{ margin: '0 0 18px' }}>
              Link cloaking means showing Instagram or TikTok&apos;s crawlers one URL while sending real visitors somewhere else. Every major platform detects it, and the result is a permanent account ban — not just a removed link.
            </p>
            <p style={{ margin: '0 0 28px', color: '#0A0A0A', fontWeight: 500 }}>
              Ultralink redirects are completely honest. Crawlers and users always see the same destination. Need to gate adult content? Use our compliant 18+ screen. Need geo-control? Use country blocking.
            </p>

            {/* Principle callout */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                borderRadius: 12,
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.15)',
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(16,185,129,0.10)',
                  border: '1px solid rgba(16,185,129,0.20)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f7b5c',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 17, height: 17 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <p style={{ fontSize: 13, color: '#4A4A4A', margin: 0 }}>
                This is a permanent product principle. We will{" "}
                <span style={{ color: '#0A0A0A', fontWeight: 600 }}>never</span> add cloaking,
                regardless of demand.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
