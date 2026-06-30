"use client";

import { useState } from "react";
import { startCheckout } from "@/app/actions/billing";
import { PRO_PLAN, type BillingInterval, type ProTier } from "@/lib/config/pricing";
import type { Tier } from "@/lib/config/pricing";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [tierIndex, setTierIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const selectedTier: ProTier = PRO_PLAN.tiers[tierIndex];
  const price = interval === "monthly" ? selectedTier.monthlyPrice : selectedTier.annualMonthlyPrice;

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    const result = await startCheckout({ tier: selectedTier.links as Tier, interval });
    if ("loginUrl" in result) { window.location.href = result.loginUrl; return; }
    if ("url" in result) { window.location.href = result.url; return; }
    setError(result.error);
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-[20px] p-6"
        style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.12)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: "#ffffff" }}>Upgrade to Pro</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg cursor-pointer" style={{ color: "#6B6B6B" }}>
            <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex gap-1 p-1 rounded-lg mb-4" style={{ background: "#2A2A2A" }}>
          {(["monthly", "annual"] as BillingInterval[]).map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInterval(i)}
              className="flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer"
              style={interval === i ? { background: "#ffffff", color: "#000000" } : { color: "#9A9A9A" }}
            >
              {i === "monthly" ? "Monthly" : "Annual −25%"}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#9A9A9A" }}>
            Number of link pages
          </label>
          <select
            value={tierIndex}
            onChange={(e) => setTierIndex(Number(e.target.value))}
            className="w-full text-sm rounded-lg px-3 py-2.5 cursor-pointer"
            style={{ background: "#2A2A2A", border: "1px solid rgba(255,255,255,.10)", color: "#ffffff", fontFamily: "inherit" }}
          >
            {PRO_PLAN.tiers.map((tier, i) => (
              <option key={tier.links} value={i} style={{ background: "#2A2A2A" }}>
                {tier.links} {tier.links === 1 ? "link page" : "link pages"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-baseline gap-1 mb-5">
          <span className="text-3xl font-bold" style={{ color: "#ffffff" }}>${price}</span>
          <span className="text-sm" style={{ color: "#6B6B6B" }}>/mo</span>
          {interval === "annual" && (
            <span className="text-xs ml-1" style={{ color: "#9A9A9A" }}>
              billed ${selectedTier.annualPrice}/yr
            </span>
          )}
        </div>

        {error && <p className="text-xs mb-3" style={{ color: "#ef4444" }}>{error}</p>}

        <button
          type="button"
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 text-sm font-semibold rounded-xl transition-opacity hover:opacity-85 cursor-pointer disabled:opacity-50"
          style={{ background: "#ffffff", color: "#000000" }}
        >
          {loading ? "Redirecting…" : `Get Pro · $${price}/mo`}
        </button>
      </div>
    </div>
  );
}
