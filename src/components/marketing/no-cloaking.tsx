export function NoCloaking() {
  return (
    <section
      aria-labelledby="no-cloaking-heading"
      style={{ maxWidth: 1140, margin: '0 auto', padding: '72px 24px' }}
    >
      {/* Floating header — no box, eyebrow removed */}
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

      {/* Two-column content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 32,
          alignItems: 'start',
        }}
      >
        {/* Left: comparison card */}
        <div
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(255,255,255,.10)',
            borderRadius: 16,
            padding: 28,
          }}
        >
          {/* Platform-safe badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(16,185,129,0.10)',
              border: '1px solid rgba(16,185,129,0.20)',
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Platform-safe</p>
              <p style={{ fontSize: 12, color: '#9A9A9A', margin: '2px 0 0' }}>Honest redirects. No crawler deception.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 8,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.18)',
              }}
            >
              <span style={{ color: '#ef4444', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✗</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', margin: '0 0 2px' }}>Link cloaking</p>
                <p style={{ fontSize: 12, color: '#9A9A9A', margin: 0, lineHeight: 1.5 }}>Shows Instagram/TikTok one URL, sends users to another. Violates ToS → permanent ban.</p>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 8,
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.18)',
              }}
            >
              <span style={{ color: '#10b981', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#10b981', margin: '0 0 2px' }}>Ultralink honest redirects</p>
                <p style={{ fontSize: 12, color: '#9A9A9A', margin: 0, lineHeight: 1.5 }}>Crawlers and users always see the same destination. Your account stays alive.</p>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 8,
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.18)',
              }}
            >
              <span style={{ color: '#10b981', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#10b981', margin: '0 0 2px' }}>Compliant 18+ age gate</p>
                <p style={{ fontSize: 12, color: '#9A9A9A', margin: 0, lineHeight: 1.5 }}>Age-restrict content the right way — no ToS violations, no account risk.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: copy */}
        <div style={{ color: '#9A9A9A', lineHeight: 1.7, fontSize: 16 }}>
          <p style={{ margin: '0 0 16px' }}>
            Link cloaking — serving Instagram and TikTok&apos;s crawlers one URL while sending your real visitors to a different destination — is a direct violation of every major social platform&apos;s terms of service.
          </p>
          <p style={{ margin: '0 0 16px' }}>
            When it&apos;s detected (and it is detected), the result is a permanent ban of your account. Not just the link. Your entire account.
          </p>
          <p style={{ margin: '0 0 16px', color: '#ffffff', fontWeight: 500 }}>
            Ultralink is built differently. Our redirects are completely honest: crawlers and users always see the same destination. No deception, no risk.
          </p>
          <p style={{ margin: '0 0 24px' }}>
            Need to gate adult content? We give you a proper 18+ verification screen. Need to control who sees your page? Use geo-blocking. Everything we build keeps your accounts safe — by doing it the right way.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                flexShrink: 0,
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.20)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <p style={{ fontSize: 14, color: '#9A9A9A', margin: 0 }}>
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
