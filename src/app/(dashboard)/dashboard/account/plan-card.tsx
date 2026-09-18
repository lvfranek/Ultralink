"use client";

import { useTransition } from "react";
import { createPortalSession } from "@/app/actions/billing";
import type { SubscriptionStatus, PlanInterval } from "@/lib/supabase/types";
import { getEffectivePlan } from "@/lib/supabase/types";
import Link from "next/link";
import { card, cardHeader, cardBody, saveBtn, SectionTitle } from "./settings-ui";

interface PlanCardProps {
  subscriptionStatus: SubscriptionStatus;
  planTier: number | null;
  planInterval: PlanInterval | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt: string | null;
  stripeCustomerId: string | null;
  linksUsed: number;
  linkCap: number;
  isEditor: boolean;
}

export function PlanCard({
  subscriptionStatus,
  planTier,
  planInterval,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  gracePeriodEndsAt,
  stripeCustomerId,
  linksUsed,
  linkCap,
  isEditor,
}: PlanCardProps) {
  const [pending, startTransition] = useTransition();
  const effectivePlan = getEffectivePlan({ subscription_status: subscriptionStatus });
  const atLimit = linksUsed >= linkCap;
  const isPastDue = subscriptionStatus === "grace";
  const isFullyCanceled = subscriptionStatus === "canceled";
  const isCancelPending = cancelAtPeriodEnd && !isFullyCanceled;
  const isCanceled = isFullyCanceled || isCancelPending;

  const handleManageBilling = () => {
    startTransition(async () => {
      const result = await createPortalSession();
      if ("url" in result) window.location.href = result.url;
    });
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getBillingLabel = (status: SubscriptionStatus): string => {
    if (isCancelPending) return "Access ends";
    switch (status) {
      case "active":
      case "trialing":
        return "Next billing";
      case "grace":
        return "Payment due by";
      case "canceled":
        return "Access ends";
      default:
        return "Next billing";
    }
  };

  const periodEndPassed = currentPeriodEnd ? new Date(currentPeriodEnd) < new Date() : false;
  const showPeriodEndRow =
    currentPeriodEnd && (effectivePlan === "pro" || isCanceled) && !(isCanceled && periodEndPassed);

  if (isEditor) {
    return (
      <div style={card}>
        <div style={cardHeader}>
          <SectionTitle>Plan &amp; usage</SectionTitle>
        </div>
        <div style={cardBody}>
          <p style={{ fontSize: 14, color: "#6B6B6B", margin: 0 }}>
            Switch to your own account to manage billing and team.
          </p>
        </div>
      </div>
    );
  }

  const planLabel =
    effectivePlan === "pro"
      ? `Pro · ${planTier ?? 1} ${planTier === 1 ? "link" : "links"} · ${planInterval === "annual" ? "Annual" : "Monthly"}`
      : "Free";

  return (
    <div style={card}>
      <div style={cardHeader}>
        <SectionTitle>Plan &amp; usage</SectionTitle>
      </div>
      <div style={cardBody}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            borderBottom: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <span style={{ fontSize: 14, color: "#9A9A9A" }}>Plan</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{planLabel}</span>
            {isPastDue && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(220,38,38,0.12)",
                  color: "#ef4444",
                  border: "1px solid rgba(220,38,38,0.3)",
                }}
              >
                Past due
              </span>
            )}
            {isCanceled && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  color: "#6B6B6B",
                  border: "1px solid rgba(255,255,255,.10)",
                }}
              >
                {isCancelPending ? "Canceling" : "Canceled"}
              </span>
            )}
          </div>
        </div>

        {showPeriodEndRow && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <span style={{ fontSize: 14, color: "#9A9A9A" }}>{getBillingLabel(subscriptionStatus)}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>{formatDate(currentPeriodEnd)}</span>
          </div>
        )}

        {isPastDue && gracePeriodEndsAt && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: 8,
              marginTop: 8,
              borderRadius: 8,
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.25)",
              fontSize: 13,
              color: "#ef4444",
            }}
          >
            Your payment failed. Update your card by {formatDate(gracePeriodEndsAt)} or your pages will go offline.
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
          <span style={{ fontSize: 14, color: "#9A9A9A" }}>Links used</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: atLimit ? "#C47A3A" : "#ffffff" }}>
            {linksUsed} / {linkCap}
          </span>
        </div>

        {atLimit && effectivePlan === "free" && (
          <div
            style={{
              marginTop: 4,
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(196,122,58,0.08)",
              border: "1px solid rgba(196,122,58,0.25)",
              fontSize: 13,
              color: "#C47A3A",
            }}
          >
            You&apos;ve reached your plan limit.{" "}
            <Link href="/#pricing" style={{ color: "#C47A3A", textDecoration: "underline", textUnderlineOffset: 2 }}>
              Upgrade to add more
            </Link>
          </div>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {stripeCustomerId && (
            <button type="button" onClick={handleManageBilling} disabled={pending} style={saveBtn(pending)}>
              {pending ? "Loading…" : "Manage billing"}
            </button>
          )}
          {effectivePlan === "free" && (
            <Link
              href="/#pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 8,
                border: "none",
                background: "#ffffff",
                color: "#000000",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Upgrade
            </Link>
          )}
          {(isFullyCanceled || isPastDue) && (
            <Link
              href="/#pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "9px 18px",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 8,
                border: "none",
                background: "#ffffff",
                color: "#000000",
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              Resubscribe
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Team card ────────────────────────────────────────────────────────────────
