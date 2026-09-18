import { describe, it, expect } from "vitest";
import { TIERS, PRO_PLAN, getLinkCap, planHasAnalytics, getMonthlyEquivalentPrice } from "./pricing";

const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

describe("getLinkCap", () => {
  it("gives active Pro users their tier's link count", () => {
    expect(getLinkCap({ subscription_status: "active", grace_period_ends_at: null, plan_tier: 25 })).toBe(25);
  });

  it("gives free and canceled users 1 link", () => {
    expect(getLinkCap({ subscription_status: "none", grace_period_ends_at: null, plan_tier: null })).toBe(1);
    expect(getLinkCap({ subscription_status: "canceled", grace_period_ends_at: null, plan_tier: 100 })).toBe(1);
  });

  it("keeps the tier during grace, drops it after", () => {
    expect(getLinkCap({ subscription_status: "grace", grace_period_ends_at: future, plan_tier: 10 })).toBe(10);
    expect(getLinkCap({ subscription_status: "grace", grace_period_ends_at: past, plan_tier: 10 })).toBe(1);
  });

  it("falls back to 1 when an active account has no tier", () => {
    expect(getLinkCap({ subscription_status: "active", grace_period_ends_at: null, plan_tier: null })).toBe(1);
  });
});

describe("planHasAnalytics", () => {
  it("is Pro-only", () => {
    expect(planHasAnalytics({ subscription_status: "active", grace_period_ends_at: null })).toBe(true);
    expect(planHasAnalytics({ subscription_status: "none", grace_period_ends_at: null })).toBe(false);
  });
});

describe("getMonthlyEquivalentPrice", () => {
  it("uses the monthly price for monthly plans", () => {
    expect(getMonthlyEquivalentPrice(400, "monthly")).toBe(399);
  });

  it("spreads the annual price over 12 months", () => {
    expect(getMonthlyEquivalentPrice(10, "annual")).toBe(22); // $264 / 12
  });

  it("treats a missing interval as monthly", () => {
    expect(getMonthlyEquivalentPrice(1, null)).toBe(8);
  });

  it("returns 0 for tiers that don't exist", () => {
    expect(getMonthlyEquivalentPrice(7, "monthly")).toBe(0);
  });
});

describe("pricing table", () => {
  it("has a price entry for every tier", () => {
    expect(PRO_PLAN.tiers.map((t) => t.links)).toEqual([...TIERS]);
  });

  it("makes annual cheaper than 12 monthly payments for every tier", () => {
    for (const t of PRO_PLAN.tiers) {
      expect(t.annualPrice, `tier ${t.links}`).toBeLessThan(t.monthlyPrice * 12);
    }
  });

  it("keeps the advertised per-month annual price in sync with the yearly total", () => {
    for (const t of PRO_PLAN.tiers) {
      expect(t.annualMonthlyPrice * 12, `tier ${t.links}`).toBe(t.annualPrice);
    }
  });
});
