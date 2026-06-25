const ITEMS = [
  {
    label: "Platform-safe",
    good: true,
    desc: "Crawlers and users always see the same destination.",
  },
  {
    label: "Link cloaking",
    good: false,
    desc: "Shows platforms one URL, sends users to another. Violates ToS → permanent ban.",
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
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
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
        <p style={{ color: '#9A9A9A', fontSize: 17, margin: '0 auto', maxWidth: 560 }}>
          Your account stays alive because we do redirects the honest way.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 40,
          alignItems: 'center',
        }}
      >
        {/* Left: comparison panel */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(255,255,255,.10)',
            borderRadius: 18,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {ITEMS.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 10,
                background: item.good ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
                border: `1px solid ${item.good ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)'}`,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  marginTop: 1,
                  fontSize: 14,
                  fontWeight: 700,
                  color: item.good ? '#10b981' : '#ef4444',
                }}
              >
                {item.good ? '✓' : '✗'}
              </span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: item.good ? '#10b981' : '#ef4444', margin: '0 0 2px' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 12, color: '#9A9A9A', margin: 0, lineHeight: 1.55 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: copy — 2 short paragraphs */}
        <div style={{ color: '#9A9A9A', lineHeight: 1.8, fontSize: 16 }}>
          <p style={{ margin: '0 0 20px' }}>
            Link cloaking means showing Instagram or TikTok&apos;s crawlers one URL while sending real visitors somewhere else. Every major platform detects it — and the result is a permanent account ban, not just a removed link.
          </p>
          <p style={{ margin: '0 0 28px', color: '#ffffff', fontWeight: 500 }}>
            Ultralink redirects are completely honest. Crawlers and users always see the same destination. Need to gate adult content? Use our compliant 18+ screen. Need geo-control? Use country blocking. Everything we build keeps your accounts safe — by doing it right.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                flexShrink: 0,
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.10)',
                border: '1px solid rgba(16,185,129,0.20)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <p style={{ fontSize: 13, color: '#9A9A9A', margin: 0 }}>
              This is a permanent product principle. We will{" "}
              <span style={{ color: '#ffffff', fontWeight: 500 }}>never</span> add cloaking,
              regardless of demand.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
