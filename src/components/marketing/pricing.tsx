"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FREE_PLAN,
  PRO_PLAN,
  type BillingInterval,
  type ProTier,
} from "@/lib/config/pricing";

const GRADIENT = 'linear-gradient(110deg,#FBC2A4 0%,#F7A8C4 33%,#C9A7F2 66%,#A7C7F7 100%)';

function CheckIcon({ muted }: { muted?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }} aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity={muted ? 0.2 : 0.3} />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }} aria-hidden="true">
      <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Pricing() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [proTierIndex, setProTierIndex] = useState(0);

  const selectedTier: ProTier = PRO_PLAN.tiers[proTierIndex];
  const proPrice =
    interval === "monthly" ? selectedTier.monthlyPrice : selectedTier.annualMonthlyPrice;

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      style={{ maxWidth: 1140, margin: '0 auto', padding: '72px 24px' }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          id="pricing-heading"
          style={{
            fontWeight: 500,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(28px, 4vw, 40px)',
            color: '#ffffff',
            margin: '0 0 10px',
          }}
        >
          Simple, honest pricing.
        </h2>
        <p style={{ color: '#9A9A9A', fontSize: 17, margin: '0 auto', maxWidth: 560 }}>
          Start free. Upgrade when you need more. No hidden fees, no lock-in.
        </p>
      </div>

      {/* Billing toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <div
          role="group"
          aria-label="Billing interval"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: 4,
            background: '#1A1A1A',
            border: '1px solid rgba(255,255,255,.10)',
            borderRadius: 10,
            gap: 4,
          }}
        >
          {(["monthly", "annual"] as BillingInterval[]).map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              style={{
                padding: '8px 20px',
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: interval === i ? '#ffffff' : 'transparent',
                color: interval === i ? '#0A0A0A' : '#9A9A9A',
                fontFamily: 'inherit',
              }}
              aria-pressed={interval === i}
            >
              {i === "monthly" ? "Monthly" : "Annual"}
              {i === "annual" && (
                <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.75 }}>
                  −25%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Two-card grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
          maxWidth: 860,
          margin: '0 auto',
        }}
      >
        {/* Free card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: 32,
            borderRadius: 20,
            background: '#1A1A1A',
            border: '1px solid rgba(255,255,255,.10)',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9A9A9A', margin: '0 0 10px' }}>
            {FREE_PLAN.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 52, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>$0</span>
            <span style={{ color: '#9A9A9A', fontSize: 14, marginBottom: 8 }}>/mo</span>
          </div>
          <p style={{ fontSize: 12, color: '#9A9A9A', margin: '0 0 32px' }}>Free forever</p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {FREE_PLAN.features.map((f) => (
              <li
                key={f.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 14,
                  color: f.included ? '#C8C8C8' : 'rgba(154,154,154,0.35)',
                }}
              >
                <span style={{ color: f.included ? '#10b981' : 'rgba(154,154,154,0.3)' }}>
                  {f.included ? <CheckIcon /> : <XIcon />}
                </span>
                {f.text}
              </li>
            ))}
          </ul>

          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '13px 0',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 11,
              border: '1px solid rgba(255,255,255,.18)',
              color: '#ffffff',
              textDecoration: 'none',
              background: 'transparent',
              boxSizing: 'border-box',
            }}
          >
            Get started free
          </Link>
        </div>

        {/* Pro card — gradient glow border */}
        <div style={{ position: 'relative', isolation: 'isolate' }}>
          {/* Glow layer — sits behind the card, never clipped */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: -16,
              borderRadius: 36,
              background: GRADIENT,
              filter: 'blur(28px)',
              opacity: 0.55,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          {/* Gradient border frame */}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              borderRadius: 21,
              padding: 1.5,
              background: GRADIENT,
            }}
          >
            {/* Card inner */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: 32,
                borderRadius: 20,
                background: '#1A1A1A',
              }}
            >
              {/* Recommended pill */}
              <div style={{ marginBottom: 12 }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,.18)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Recommended
                </span>
              </div>

              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ffffff', margin: '0 0 10px' }}>
                {PRO_PLAN.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 52, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  ${proPrice}
                </span>
                <span style={{ color: '#9A9A9A', fontSize: 14, marginBottom: 8 }}>/mo</span>
              </div>
              <p style={{ fontSize: 12, color: '#9A9A9A', margin: '0 0 20px' }}>
                {interval === "annual"
                  ? `Billed $${selectedTier.annualPrice}/yr`
                  : "Billed monthly"}
              </p>

              {/* Volume selector */}
              <div style={{ marginBottom: 28 }}>
                <label
                  htmlFor="pro-links"
                  style={{ display: 'block', fontSize: 12, color: '#9A9A9A', marginBottom: 6, fontWeight: 500 }}
                >
                  Number of link pages
                </label>
                <select
                  id="pro-links"
                  value={proTierIndex}
                  onChange={(e) => setProTierIndex(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,.18)',
                    color: '#ffffff',
                    fontSize: 14,
                    borderRadius: 9,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  {PRO_PLAN.tiers.map((tier, i) => (
                    <option key={tier.links} value={i} style={{ background: '#1A1A1A' }}>
                      {tier.links} {tier.links === 1 ? "link page" : "link pages"}
                    </option>
                  ))}
                </select>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                {PRO_PLAN.features.map((f) => (
                  <li
                    key={f.text}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 14,
                      color: '#C8C8C8',
                    }}
                  >
                    <span style={{ color: '#10b981' }}>
                      <CheckIcon />
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              <Link
                href="/login?plan=pro"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '13px 0',
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 11,
                  border: 'none',
                  color: '#0A0A0A',
                  textDecoration: 'none',
                  background: '#ffffff',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                Get Pro
              </Link>
            </div>
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9A9A9A', marginTop: 28 }}>
        All prices in USD. Cancel any time.
      </p>
    </section>
  );
}
