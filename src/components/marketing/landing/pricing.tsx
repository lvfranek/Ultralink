"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { FREE_PLAN, PRO_PLAN, type BillingInterval, type Tier } from "@/lib/config/pricing";
import { startCheckout } from "@/app/actions/billing";
import { SoonBadge, cx, delay, spotlight } from "./shared";
import s from "./landing.module.css";

// Shown as "coming soon" until the feature ships
const SOON_FEATURES = new Set(["Custom domains"]);

export function Pricing() {
  const [interval, setInterval] = useState<BillingInterval>("annual");
  const [tierIdx, setTierIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tier = PRO_PLAN.tiers[tierIdx];
  const annual = interval === "annual";
  const price = annual ? tier.annualMonthlyPrice : tier.monthlyPrice;

  const handleGetPro = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await startCheckout({ tier: tier.links as Tier, interval });
      if ("loginUrl" in result) {
        window.location.href = result.loginUrl;
        return;
      }
      if ("url" in result) {
        window.location.href = result.url;
        return;
      }
      setError(result.error ?? "Something went wrong.");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <section id="pricing" className={s.section} aria-labelledby="pricing-title">
      <div className={s.sectionHead}>
        <p className={s.eyebrow} data-reveal>
          Pricing
        </p>
        <h2 id="pricing-title" className={s.h2} data-reveal style={delay(80)}>
          Start free.
          <br />
          <em className={s.serifAccent}>Scale when you&apos;re ready.</em>
        </h2>
        <div className={s.billing} role="group" aria-label="Billing period" data-reveal style={delay(160)}>
          <button
            type="button"
            className={cx(!annual && s.billingOn)}
            aria-pressed={!annual}
            onClick={() => setInterval("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={cx(annual && s.billingOn)}
            aria-pressed={annual}
            onClick={() => setInterval("annual")}
          >
            Annual <span className={s.save}>−25%</span>
          </button>
        </div>
      </div>

      <div className={s.plans}>
        <article className={s.plan} onPointerMove={spotlight} data-reveal>
          <h3 className={s.planName}>Free</h3>
          <div className={s.price}>
            <span className={s.priceNum}>$0</span>
            <span className={s.pricePer}>forever</span>
          </div>
          <p className={s.planDesc}>Everything you need for your first link page.</p>
          <Link href="/login?mode=signup" className={s.btnGhost}>
            Get started free
          </Link>
          <ul className={s.planList}>
            {FREE_PLAN.features
              .filter((f) => f.included)
              .map((f) => (
                <li key={f.text}>
                  <Check size={15} strokeWidth={2.5} aria-hidden="true" />
                  {f.text}
                </li>
              ))}
          </ul>
        </article>

        <article className={cx(s.plan, s.planPro)} onPointerMove={spotlight} data-reveal style={delay(120)}>
          <span className={s.spinner} aria-hidden="true" />
          <div className={s.planProInner}>
            <div className={s.planTop}>
              <h3 className={s.planName}>Pro</h3>
              <span className={s.planBadge}>Most popular</span>
            </div>
            <div className={s.price}>
              <span key={`${price}-${interval}`} className={cx(s.priceNum, s.priceAnim)}>
                ${price}
              </span>
              <span className={s.pricePer}>
                / month
                {annual && (
                  <>
                    <br />
                    billed ${tier.annualPrice}/yr
                  </>
                )}
              </span>
            </div>

            <label className={s.sliderLabel} htmlFor="tier-slider">
              <span>Link pages</span>
              <strong>{tier.links}</strong>
            </label>
            <input
              id="tier-slider"
              type="range"
              min={0}
              max={PRO_PLAN.tiers.length - 1}
              step={1}
              value={tierIdx}
              aria-valuetext={`${tier.links} link ${tier.links === 1 ? "page" : "pages"}`}
              onChange={(e) => setTierIdx(Number(e.target.value))}
              className={s.slider}
              style={{ "--p": `${(tierIdx / (PRO_PLAN.tiers.length - 1)) * 100}%` } as CSSProperties}
            />

            <button type="button" className={s.btnLight} onClick={handleGetPro} disabled={loading}>
              {loading ? (
                "Redirecting…"
              ) : (
                <>
                  Get Pro <ArrowUpRight size={16} strokeWidth={2.25} aria-hidden="true" />
                </>
              )}
            </button>
            {error && (
              <p role="alert" className={s.checkoutError}>
                {error}
              </p>
            )}
            <ul className={s.planList}>
              {PRO_PLAN.features.map((f) => (
                <li key={f.text}>
                  <Check size={15} strokeWidth={2.5} aria-hidden="true" />
                  {f.text}
                  {SOON_FEATURES.has(f.text) && <SoonBadge />}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
      <p className={s.priceNote}>Prices in USD. Cancel any time.</p>
    </section>
  );
}
