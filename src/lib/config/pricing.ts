export type BillingInterval = "monthly" | "annual";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface ProTier {
  links: number;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  annualPrice: number;
}

export interface FreePlan {
  id: "free";
  name: "Free";
  monthlyPrice: 0;
  annualMonthlyPrice: 0;
  annualPrice: 0;
  links: 1;
  users: 1;
  features: PlanFeature[];
  badge: null;
}

export interface ProPlan {
  id: "pro";
  name: "Pro";
  tiers: ProTier[];
  users: "unlimited";
  features: PlanFeature[];
  badge: "Recommended";
}

export const FREE_PLAN: FreePlan = {
  id: "free",
  name: "Free",
  monthlyPrice: 0,
  annualMonthlyPrice: 0,
  annualPrice: 0,
  links: 1,
  users: 1,
  badge: null,
  features: [
    { text: "1 link page", included: true },
    { text: "Beautiful designs", included: true },
    { text: "Deep linking", included: true },
    { text: "Fast loading", included: true },
    { text: "18+ age gate", included: true },
    { text: "Active badge", included: false },
    { text: "Country blocking", included: false },
    { text: "Custom domains", included: false },
    { text: "Team access", included: false },
    { text: "Analytics", included: false },
    { text: "Win-Back", included: false },
  ],
};

export const PRO_PLAN: ProPlan = {
  id: "pro",
  name: "Pro",
  users: "unlimited",
  badge: "Recommended",
  tiers: [
    { links: 1,   monthlyPrice: 8,   annualMonthlyPrice: 6,   annualPrice: 72 },
    { links: 3,   monthlyPrice: 14,  annualMonthlyPrice: 11,  annualPrice: 132 },
    { links: 10,  monthlyPrice: 29,  annualMonthlyPrice: 22,  annualPrice: 264 },
    { links: 25,  monthlyPrice: 49,  annualMonthlyPrice: 37,  annualPrice: 444 },
    { links: 50,  monthlyPrice: 89,  annualMonthlyPrice: 67,  annualPrice: 804 },
    { links: 100, monthlyPrice: 149, annualMonthlyPrice: 112, annualPrice: 1344 },
    { links: 200, monthlyPrice: 249, annualMonthlyPrice: 187, annualPrice: 2244 },
    { links: 400, monthlyPrice: 399, annualMonthlyPrice: 299, annualPrice: 3588 },
  ],
  features: [
    { text: "Everything in Free", included: true },
    { text: "Active badge", included: true },
    { text: "Country blocking", included: true },
    { text: "Custom domains", included: true },
    { text: "Team access", included: true },
    { text: "Full analytics", included: true },
    { text: "Win-Back", included: true },
    { text: "No Ultralink badge", included: true },
  ],
};

export const PLANS = [FREE_PLAN, PRO_PLAN] as const;

// Feature → minimum plan (Phase 4 will enforce; this is the source of truth)
export const FEATURE_PLAN: Record<string, "free" | "pro"> = {
  age_gate:        "free",
  active_badge:    "pro",
  country_blocking: "pro",
  analytics:       "pro",
  custom_domains:  "pro",
  team_access:     "pro",
  win_back:        "pro",
  badge_removal:   "pro",
};

export function planHasAnalytics(plan: string): boolean {
  return plan === "pro";
}

export function getLinkCap(plan: string): number {
  switch (plan) {
    case "pro":
      return PRO_PLAN.tiers[0].links; // smallest tier (1); Phase 4 will use real tier
    default:
      return FREE_PLAN.links;
  }
}
