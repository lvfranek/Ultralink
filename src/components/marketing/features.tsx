const GRADIENT = 'linear-gradient(110deg,#FBC2A4,#F7A8C4,#C9A7F2,#A7C7F7)';

const MAIN_BENEFITS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: 'Conversion-ready designs',
    body: 'Pages tuned to convert, or styled to match your brand.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-6 3h.008v.008H9v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    title: 'Deep linking',
    body: 'Your links open in the real browser, not a broken in-app one.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: 'Custom domains',
    body: 'Put your own domain on your page — your brand, your URL.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Team access',
    body: 'Let your assistant create links and track data for you.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
    title: 'Real analytics',
    body: 'Clicks, CTR, countries, devices, time on page, and top links.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Blazing fast',
    body: 'Pages load instantly, even on slow connections.',
  },
];

const ADVANCED_BENEFITS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: '18+ age gate',
    body: 'A clean, compliant age screen for mature content.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: 'Active badge 🟢',
    body: 'Show a live "active now" badge to build trust.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    title: 'Country blocking',
    body: 'Restrict your page to specific countries.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    ),
    title: 'Win-Back',
    body: 'Offer leaving visitors a second link before they go.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
    title: 'Simple or advanced',
    body: 'Easy for your first link, deep when you need it.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    title: 'Unlimited links',
    body: 'Create as many link pages as you want.',
  },
];

function BenefitCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div
      className="benefit"
      style={{ position: 'relative', isolation: 'isolate', borderRadius: 16 }}
    >
      <div
        aria-hidden
        className="benefit-glow"
        style={{
          position: 'absolute',
          inset: -3,
          borderRadius: 19,
          background: GRADIENT,
          filter: 'blur(16px)',
          opacity: 0,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          background: '#fff',
          color: '#0A0A0A',
          border: '1px solid rgba(0,0,0,.06)',
          borderRadius: 16,
          padding: 22,
          height: '100%',
        }}
      >
        <div style={{ color: '#8a8a8a', marginBottom: 14 }}>{icon}</div>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px', color: '#0A0A0A' }}>{title}</h3>
        <p style={{ color: '#5a5a5a', fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>{body}</p>
      </div>
    </div>
  );
}

import React from 'react';

const GRID: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 16,
};

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      style={{ maxWidth: 1140, margin: '0 auto', padding: '72px 24px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          id="features-heading"
          style={{
            fontWeight: 500,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(28px, 4vw, 40px)',
            color: '#ffffff',
            margin: '0 0 10px',
          }}
        >
          Everything you need to grow.
        </h2>
        <p style={{ color: '#9A9A9A', fontSize: 17, margin: '0 auto', maxWidth: 600 }}>
          Simple enough for your first link. Powerful enough for an agency.
        </p>
      </div>

      <div style={GRID}>
        {MAIN_BENEFITS.map((b) => (
          <BenefitCard key={b.title} {...b} />
        ))}
      </div>

      <p
        style={{
          color: '#ffffff',
          fontSize: 15,
          fontWeight: 600,
          textAlign: 'center',
          opacity: 0.85,
          margin: '44px 0 16px',
        }}
      >
        Advanced controls
      </p>

      <div style={GRID}>
        {ADVANCED_BENEFITS.map((b) => (
          <BenefitCard key={b.title} {...b} />
        ))}
      </div>
    </section>
  );
}
