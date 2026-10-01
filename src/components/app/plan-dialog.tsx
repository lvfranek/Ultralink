"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { startCheckout } from "@/app/actions/billing";
import { PRO_PLAN, type BillingInterval, type Tier } from "@/lib/config/pricing";
import { cx, Dialog, Segmented } from "./ui";
import s from "./app.module.css";

/** Pick a Pro size and billing period, then continue to Stripe checkout */
export function PlanDialog({ onClose, minPages = 1 }: { onClose: () => void; minPages?: number }) {
  const tiers = PRO_PLAN.tiers;
  // Start on the smallest plan that fits the pages they already have
  const [i, setI] = useState(() =>
    Math.max(
      0,
      tiers.findIndex((t) => t.links >= minPages),
    ),
  );
  const [interval, setInterval] = useState<BillingInterval>("annual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = tiers[i];
  const monthly = interval === "annual" ? t.annualMonthlyPrice : t.monthlyPrice;

  const checkout = async () => {
    setLoading(true);
    setError(null);
    const result = await startCheckout({ tier: t.links as Tier, interval });
    if ("url" in result) return void (window.location.href = result.url);
    if ("loginUrl" in result) return void (window.location.href = result.loginUrl);
    setError(result.error);
    setLoading(false);
  };

  return (
    <Dialog
      title="Upgrade to Pro"
      description="Analytics, Win-Back, country blocking, team access and more link pages. Pick how many pages you need."
      onClose={onClose}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
        <Segmented
          label="Billing"
          value={interval}
          onChange={setInterval}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "annual", label: "Annual · save 25%" },
          ]}
        />
      </div>
      <div className={s.tierHead}>
        <div className={s.tierLinks}>
          <strong>{t.links}</strong>
          link {t.links === 1 ? "page" : "pages"}
        </div>
        <div className={s.tierPrice}>
          <strong>${monthly}</strong>
          per month{interval === "annual" ? `, $${t.annualPrice} yearly` : ""}
        </div>
      </div>
      <input
        type="range"
        className={s.range}
        min={0}
        max={tiers.length - 1}
        step={1}
        value={i}
        onChange={(e) => setI(Number(e.target.value))}
        aria-label="Number of link pages"
        aria-valuetext={`${t.links} link pages, $${monthly} per month`}
        style={{ "--p": `${(i / (tiers.length - 1)) * 100}%` } as React.CSSProperties}
      />
      <div className={s.ticks} aria-hidden="true">
        {tiers.map((x) => (
          <span key={x.links}>{x.links}</span>
        ))}
      </div>
      {t.links < minPages && (
        <p className={cx(s.hint, s.warn)} style={{ marginTop: 14 }}>
          You have {minPages} pages. Pages beyond {t.links} stay hidden on this plan.
        </p>
      )}
      {error && <p className={cx(s.hint, s.err)}>{error}</p>}
      <div className={s.dialogActions}>
        <button type="button" className={s.btnGhost} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={s.btnLight} disabled={loading} onClick={() => void checkout()}>
          {loading ? (
            <Loader2 size={15} className={s.spin} aria-hidden="true" />
          ) : (
            <Sparkles size={15} aria-hidden="true" />
          )}
          Continue · ${monthly}/mo
        </button>
      </div>
      <p className={s.hint} style={{ justifyContent: "center", marginTop: 14 }}>
        Secure checkout with Stripe. Cancel anytime.
      </p>
    </Dialog>
  );
}
