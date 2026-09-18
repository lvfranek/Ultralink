"use client";

import { useState } from "react";
import { FREE_PLAN, PRO_PLAN, type BillingInterval, type ProTier, type Tier } from "@/lib/config/pricing";
import { startCheckout } from "@/app/actions/billing";
import Link from "next/link";

const GRADIENT = "linear-gradient(110deg,#FBC2A4 0%,#F7A8C4 33%,#C9A7F2 66%,#A7C7F7 100%)";

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16, flexShrink: 0 }} aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeOpacity={0.2} />
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
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const selectedTier: ProTier = PRO_PLAN.tiers[proTierIndex];
  const proPrice = interval === "monthly" ? selectedTier.monthlyPrice : selectedTier.annualMonthlyPrice;

  const handleGetPro = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const result = await startCheckout({
        tier: selectedTier.links as Tier,
        interval,
      });
      if ("loginUrl" in result) {
        window.location.href = result.loginUrl;
        return;
      }
      if ("url" in result) {
        window.location.href = result.url;
        return;
      }
      setCheckoutError(result.error ?? "Something went wrong.");
    } catch {
      setCheckoutError("Something went wrong. Please try again.");
    }
    setCheckoutLoading(false);
  };

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      style={{ maxWidth: 1140, margin: "0 auto", padding: "72px 24px" }}
    >
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2
          id="pricing-heading"
          style={{
            fontWeight: 500,
            letterSpacing: "-0.02em",
            fontSize: "clamp(28px, 4vw, 40px)",
            color: "#ffffff",
            margin: "0 0 10px",
          }}
        >
          Simple, honest pricing.
        </h2>
        <p style={{ color: "#9A9A9A", fontSize: 17, margin: "0 auto", maxWidth: 560 }}>
          Start free. Upgrade when you need more. No hidden fees, no lock-in.
        </p>
      </div>

      {/* Billing toggle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
        <div
          role="group"
          aria-label="Billing interval"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: 4,
            background: "#1A1A1A",
            border: "1px solid rgba(255,255,255,.10)",
            borderRadius: 10,
            gap: 4,
          }}
        >
          {(["monthly", "annual"] as BillingInterval[]).map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              style={{
                padding: "8px 20px",
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
                background: interval === i ? "#ffffff" : "transparent",
                color: interval === i ? "#0A0A0A" : "#9A9A9A",
                fontFamily: "inherit",
              }}
              aria-pressed={interval === i}
            >
              {i === "monthly" ? "Monthly" : "Annual"}
              {i === "annual" && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  -25%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Two-card grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          alignItems: "stretch",
          gap: 20,
          maxWidth: 820,
          margin: "0 auto",
          paddingTop: 14,
        }}
      >
        {/* Free — white card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: "28px 28px 24px",
            borderRadius: 20,
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,.08)",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(10,10,10,.6)",
              margin: "0 0 10px",
            }}
          >
            {FREE_PLAN.name}
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em", lineHeight: 1 }}>
              $0
            </span>
            <span style={{ color: "rgba(10,10,10,.6)", fontSize: 14, marginBottom: 6 }}>/mo</span>
          </div>
          <p style={{ fontSize: 12, color: "rgba(10,10,10,.6)", margin: "0 0 24px" }}>Free forever</p>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 16px",
              display: "flex",
              flexDirection: "column",
              gap: 9,
              flex: 1,
            }}
          >
            {FREE_PLAN.features.map((f) => (
              <li
                key={f.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 14,
                  color: f.included ? "#0A0A0A" : "#6B6B6B",
                }}
              >
                <span style={{ color: f.included ? "#10b981" : "rgba(10,10,10,.35)" }}>
                  {f.included ? <CheckIcon /> : <XIcon />}
                </span>
                <span style={f.included ? undefined : { textDecoration: "line-through" }}>
                  <span className="sr-only">{f.included ? "Included: " : "Not included: "}</span>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/login?mode=signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              marginTop: "auto",
              padding: "12px 0",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 11,
              border: "1px solid rgba(0,0,0,.12)",
              color: "#0A0A0A",
              textDecoration: "none",
              background: "transparent",
              boxSizing: "border-box",
              transition: "opacity 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.7";
              e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Get started free
          </Link>
        </div>

        {/* Pro — gradient border */}
        <div
          style={{
            position: "relative",
            isolation: "isolate",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Pastel glow */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: -16,
              borderRadius: 36,
              background: GRADIENT,
              filter: "blur(28px)",
              opacity: 0.45,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          {/* Gradient border frame */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              borderRadius: 21,
              padding: 1.5,
              background: GRADIENT,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Badge */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 16px",
                  borderRadius: 999,
                  background: "#ffffff",
                  color: "#0A0A0A",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  boxShadow: "0 1px 6px rgba(0,0,0,.10)",
                }}
              >
                Recommended
              </span>
            </div>

            {/* White inner card */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                padding: "28px 28px 24px",
                borderRadius: 20,
                background: "#ffffff",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(10,10,10,.6)",
                  margin: "0 0 10px",
                }}
              >
                {PRO_PLAN.name}
              </p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 4 }}>
                <span
                  style={{ fontSize: 48, fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em", lineHeight: 1 }}
                >
                  ${proPrice}
                </span>
                <span style={{ color: "rgba(10,10,10,.6)", fontSize: 14, marginBottom: 6 }}>/mo</span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(10,10,10,.6)", margin: "0 0 16px" }}>
                {interval === "annual" ? `Billed $${selectedTier.annualPrice}/yr` : "Billed monthly"}
              </p>

              {/* Volume selector */}
              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="pro-links"
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "rgba(10,10,10,.6)",
                    marginBottom: 6,
                    fontWeight: 500,
                  }}
                >
                  Number of link pages
                </label>
                <select
                  id="pro-links"
                  value={proTierIndex}
                  onChange={(e) => setProTierIndex(Number(e.target.value))}
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,.03)",
                    border: "1px solid rgba(0,0,0,.10)",
                    color: "#0A0A0A",
                    fontSize: 14,
                    borderRadius: 9,
                    padding: "10px 12px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {PRO_PLAN.tiers.map((tier, i) => (
                    <option key={tier.links} value={i}>
                      {tier.links} {tier.links === 1 ? "link page" : "link pages"}
                    </option>
                  ))}
                </select>
              </div>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                  flex: 1,
                }}
              >
                {PRO_PLAN.features.map((f) => (
                  <li
                    key={f.text}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 14,
                      color: "#0A0A0A",
                    }}
                  >
                    <span style={{ color: "#10b981" }}>
                      <CheckIcon />
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              {checkoutError && <p style={{ fontSize: 12, color: "#dc2626", marginBottom: 8 }}>{checkoutError}</p>}

              <button
                type="button"
                onClick={handleGetPro}
                disabled={checkoutLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  marginTop: "auto",
                  padding: "12px 0",
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 11,
                  border: "none",
                  color: "#ffffff",
                  textDecoration: "none",
                  background: checkoutLoading ? "rgba(10,10,10,0.4)" : "#0A0A0A",
                  boxSizing: "border-box",
                  cursor: checkoutLoading ? "not-allowed" : "pointer",
                  transition: "opacity 0.15s, transform 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  if (!checkoutLoading) {
                    e.currentTarget.style.opacity = "0.8";
                    e.currentTarget.style.transform = "scale(0.97)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {checkoutLoading ? "Redirecting…" : "Get Pro"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: "#9A9A9A", marginTop: 24 }}>
        All prices in USD. Cancel any time.
      </p>
    </section>
  );
}
