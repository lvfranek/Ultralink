"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FREE_PLAN,
  CREATOR_PLAN,
  AGENCY_PLAN,
  type BillingInterval,
  type AgencyTier,
} from "@/lib/config/pricing";

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }} aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity="0.3" />
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
  const [agencyTierIndex, setAgencyTierIndex] = useState(0);

  const selectedAgencyTier: AgencyTier = AGENCY_PLAN.tiers[agencyTierIndex];

  const agencyPrice =
    interval === "monthly"
      ? selectedAgencyTier.monthlyPrice
      : selectedAgencyTier.annualMonthlyPrice;

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      style={{ maxWidth: 1140, margin: '0 auto', padding: '72px 24px' }}
    >
      {/* Floating header — no wrapper box */}
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

      {/* Plans grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {/* Free */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: 28,
            borderRadius: 18,
            background: '#1A1A1A',
            border: '1px solid rgba(255,255,255,.10)',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9A9A9A', margin: '0 0 8px' }}>
            {FREE_PLAN.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>$0</span>
            <span style={{ color: '#9A9A9A', fontSize: 14, marginBottom: 6 }}>/mo</span>
          </div>
          <p style={{ fontSize: 12, color: '#9A9A9A', margin: '0 0 28px' }}>Free forever</p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {FREE_PLAN.features.map((f) => (
              <li
                key={f.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 14,
                  color: f.included ? '#9A9A9A' : 'rgba(154,154,154,0.4)',
                  textDecoration: f.included ? 'none' : 'line-through',
                }}
              >
                <span style={{ color: f.included ? '#10b981' : 'rgba(154,154,154,0.4)' }}>
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
              padding: '12px 0',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,.15)',
              color: '#ffffff',
              textDecoration: 'none',
              background: 'transparent',
              boxSizing: 'border-box',
            }}
          >
            Get started free
          </Link>
        </div>

        {/* Creator — most popular */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: 28,
            borderRadius: 18,
            background: '#1A1A1A',
            border: '2px solid #ffffff',
          }}
        >
          {/* Popular badge */}
          <div
            style={{
              position: 'absolute',
              top: -14,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '4px 16px',
              borderRadius: 999,
              background: '#ffffff',
              color: '#0A0A0A',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}
          >
            {CREATOR_PLAN.badge}
          </div>

          <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ffffff', margin: '0 0 8px' }}>
            {CREATOR_PLAN.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              ${interval === "monthly" ? CREATOR_PLAN.monthlyPrice : CREATOR_PLAN.annualMonthlyPrice}
            </span>
            <span style={{ color: '#9A9A9A', fontSize: 14, marginBottom: 6 }}>/mo</span>
          </div>
          <p style={{ fontSize: 12, color: '#9A9A9A', margin: '0 0 28px' }}>
            {interval === "annual"
              ? `Billed $${CREATOR_PLAN.annualPrice}/yr`
              : `Billed monthly · ${CREATOR_PLAN.trialDays}-day free trial`}
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {CREATOR_PLAN.features.map((f) => (
              <li
                key={f.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 14,
                  color: f.included ? '#9A9A9A' : 'rgba(154,154,154,0.4)',
                  textDecoration: f.included ? 'none' : 'line-through',
                }}
              >
                <span style={{ color: f.included ? '#10b981' : 'rgba(154,154,154,0.4)' }}>
                  {f.included ? <CheckIcon /> : <XIcon />}
                </span>
                {f.text}
              </li>
            ))}
          </ul>

          <Link
            href="/login?plan=creator"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '12px 0',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 10,
              border: 'none',
              color: '#0A0A0A',
              textDecoration: 'none',
              background: '#ffffff',
              boxSizing: 'border-box',
              cursor: 'pointer',
            }}
          >
            Start {CREATOR_PLAN.trialDays}-day free trial
          </Link>
        </div>

        {/* Agency */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: 28,
            borderRadius: 18,
            background: '#1A1A1A',
            border: '1px solid rgba(255,255,255,.10)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9A9A9A', margin: 0 }}>
              {AGENCY_PLAN.name}
            </p>
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,.15)',
                fontSize: 11,
                fontWeight: 500,
                color: '#9A9A9A',
              }}
            >
              {AGENCY_PLAN.badge}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
              ${agencyPrice}
            </span>
            <span style={{ color: '#9A9A9A', fontSize: 14, marginBottom: 6 }}>/mo</span>
          </div>
          <p style={{ fontSize: 12, color: '#9A9A9A', margin: '0 0 16px' }}>
            {interval === "annual"
              ? `Billed $${selectedAgencyTier.annualPrice}/yr`
              : "Billed monthly"}
          </p>

          {/* Link volume selector */}
          <div style={{ marginBottom: 28 }}>
            <label htmlFor="agency-links" style={{ display: 'block', fontSize: 12, color: '#9A9A9A', marginBottom: 6, fontWeight: 500 }}>
              Number of link pages
            </label>
            <select
              id="agency-links"
              value={agencyTierIndex}
              onChange={(e) => setAgencyTierIndex(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,.15)',
                color: '#ffffff',
                fontSize: 14,
                borderRadius: 8,
                padding: '10px 12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {AGENCY_PLAN.tiers.map((tier, i) => (
                <option key={tier.links} value={i} style={{ background: '#1A1A1A' }}>
                  {tier.links} links
                </option>
              ))}
            </select>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {AGENCY_PLAN.features.map((f) => (
              <li
                key={f.text}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 14,
                  color: f.included ? '#9A9A9A' : 'rgba(154,154,154,0.4)',
                }}
              >
                <span style={{ color: f.included ? '#10b981' : 'rgba(154,154,154,0.4)' }}>
                  {f.included ? <CheckIcon /> : <XIcon />}
                </span>
                {f.text}
              </li>
            ))}
          </ul>

          <Link
            href="/login?plan=agency"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '12px 0',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,.15)',
              color: '#ffffff',
              textDecoration: 'none',
              background: 'transparent',
              boxSizing: 'border-box',
            }}
          >
            Get started
          </Link>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9A9A9A', marginTop: 24 }}>
        All prices in USD. Annual billing is charged as a single payment at the start of the year. Cancel any time.
      </p>
    </section>
  );
}
