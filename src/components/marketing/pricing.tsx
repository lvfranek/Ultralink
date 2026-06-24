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
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity="0.2" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
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
      className="px-6"
      aria-labelledby="pricing-heading"
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
        <div className="text-center mb-12">
          <h2
            id="pricing-heading"
            className="text-4xl sm:text-5xl font-black text-text mb-4 tracking-tight"
          >
            Simple, honest pricing.
          </h2>
          <p className="text-text-muted text-lg max-w-md mx-auto">
            Start free. Upgrade when you need more. No hidden fees, no lock-in.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div
            role="group"
            aria-label="Billing interval"
            className="inline-flex items-center p-1 bg-surface border border-border rounded-[var(--radius)] gap-1"
          >
            {(["monthly", "annual"] as BillingInterval[]).map((i) => (
              <button
                key={i}
                onClick={() => setInterval(i)}
                className={[
                  "px-5 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-all duration-150 cursor-pointer",
                  interval === i
                    ? "bg-gold text-bg shadow-sm"
                    : "text-text-muted hover:text-text",
                ].join(" ")}
                aria-pressed={interval === i}
              >
                {i === "monthly" ? "Monthly" : "Annual"}
                {i === "annual" && (
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider opacity-80">
                    −25%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="relative flex flex-col p-7 rounded-[var(--radius-lg)] bg-white border border-[#E4E4E7] shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-2">
              {FREE_PLAN.name}
            </p>
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-5xl font-bold text-text tracking-tight">$0</span>
              <span className="text-text-muted text-sm mb-2">/mo</span>
            </div>
            <p className="text-xs text-text-subtle mb-8">Free forever</p>

            <ul className="space-y-3 mb-8 flex-1">
              {FREE_PLAN.features.map((f) => (
                <li
                  key={f.text}
                  className={`flex items-center gap-2.5 text-sm ${f.included ? "text-text-muted" : "text-text-subtle line-through"}`}
                >
                  <span className={f.included ? "text-emerald-500" : "text-text-subtle"}>
                    {f.included ? <CheckIcon /> : <XIcon />}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3 text-sm font-semibold rounded-[var(--radius)] border border-border-strong text-text hover:bg-surface-2 transition-all duration-150"
            >
              Get started free
            </Link>
          </div>

          {/* Creator — most popular */}
          <div className="relative flex flex-col p-7 rounded-[var(--radius-lg)] bg-white border-2 border-text shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
            {/* Popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold text-bg text-xs font-bold uppercase tracking-wider whitespace-nowrap">
              {CREATOR_PLAN.badge}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-text mb-2">
              {CREATOR_PLAN.name}
            </p>
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-5xl font-bold text-text tracking-tight">
                ${interval === "monthly" ? CREATOR_PLAN.monthlyPrice : CREATOR_PLAN.annualMonthlyPrice}
              </span>
              <span className="text-text-muted text-sm mb-2">/mo</span>
            </div>
            <p className="text-xs text-text-subtle mb-8">
              {interval === "annual"
                ? `Billed $${CREATOR_PLAN.annualPrice}/yr`
                : `Billed monthly · ${CREATOR_PLAN.trialDays}-day free trial`}
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {CREATOR_PLAN.features.map((f) => (
                <li
                  key={f.text}
                  className={`flex items-center gap-2.5 text-sm ${f.included ? "text-text-muted" : "text-text-subtle line-through"}`}
                >
                  <span className={f.included ? "text-emerald-500" : "text-text-subtle"}>
                    {f.included ? <CheckIcon /> : <XIcon />}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            <Link
              href="/login?plan=creator"
              className="inline-flex items-center justify-center w-full py-3 text-sm font-semibold rounded-[var(--radius)] bg-gold text-bg hover:bg-gold-bright transition-all duration-150 shadow-[0_1px_8px_rgba(0,0,0,0.12)] active:scale-[0.98]"
            >
              Start {CREATOR_PLAN.trialDays}-day free trial
            </Link>
          </div>

          {/* Agency */}
          <div className="relative flex flex-col p-7 rounded-[var(--radius-lg)] bg-white border border-[#E4E4E7] shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">
                {AGENCY_PLAN.name}
              </p>
              <span className="px-2.5 py-1 rounded-full border border-border-strong bg-surface-2 text-xs font-medium text-text-muted">
                {AGENCY_PLAN.badge}
              </span>
            </div>

            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-5xl font-bold text-text tracking-tight">
                ${agencyPrice}
              </span>
              <span className="text-text-muted text-sm mb-2">/mo</span>
            </div>
            <p className="text-xs text-text-subtle mb-5">
              {interval === "annual"
                ? `Billed $${selectedAgencyTier.annualPrice}/yr`
                : "Billed monthly"}
            </p>

            {/* Link volume selector */}
            <div className="mb-8">
              <label htmlFor="agency-links" className="block text-xs text-text-muted mb-2 font-medium">
                Number of link pages
              </label>
              <select
                id="agency-links"
                value={agencyTierIndex}
                onChange={(e) => setAgencyTierIndex(Number(e.target.value))}
                className="w-full bg-surface-2 border border-border-strong text-text text-sm rounded-[var(--radius-sm)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-text/20 focus:border-text/30 transition-all duration-150 cursor-pointer"
              >
                {AGENCY_PLAN.tiers.map((tier, i) => (
                  <option key={tier.links} value={i}>
                    {tier.links} links
                  </option>
                ))}
              </select>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {AGENCY_PLAN.features.map((f) => (
                <li
                  key={f.text}
                  className={`flex items-center gap-2.5 text-sm ${f.included ? "text-text-muted" : "text-text-subtle"}`}
                >
                  <span className={f.included ? "text-emerald-500" : "text-text-subtle"}>
                    {f.included ? <CheckIcon /> : <XIcon />}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>

            <Link
              href="/login?plan=agency"
              className="inline-flex items-center justify-center w-full py-3 text-sm font-semibold rounded-[var(--radius)] border border-border-strong text-text hover:bg-surface-2 transition-all duration-150"
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-text-subtle mt-8">
          All prices in USD. Annual billing is charged as a single payment at the start of the year.
          Cancel any time.
        </p>
      </div>
    </section>
  );
}
