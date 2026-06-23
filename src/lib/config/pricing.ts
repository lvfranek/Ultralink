export type BillingInterval = "monthly" | "annual";

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface FreePlan {
  id: "free";
  name: "Free";
  monthlyPrice: 0;
  annualMonthlyPrice: 0;
  annualPrice: 0;
  links: 1;
  users: 1;
  trialDays: 0;
  features: PlanFeature[];
  badge: null;
}

export interface CreatorPlan {
  id: "creator";
  name: "Creator";
  monthlyPrice: 8;
  annualMonthlyPrice: 6;
  annualPrice: 72;
  links: 1;
  users: 1;
  trialDays: 7;
  features: PlanFeature[];
  badge: "Most popular";
}

export interface AgencyTier {
  links: number;
  monthlyPrice: number;
  annualMonthlyPrice: number;
  annualPrice: number;
}

export interface AgencyPlan {
  id: "agency";
  name: "Agency";
  tiers: AgencyTier[];
  users: "unlimited";
  trialDays: 0;
  features: PlanFeature[];
  badge: "For teams";
}

export const FREE_PLAN: FreePlan = {
  id: "free",
  name: "Free",
  monthlyPrice: 0,
  annualMonthlyPrice: 0,
  annualPrice: 0,
  links: 1,
  users: 1,
  trialDays: 0,
  badge: null,
  features: [
    { text: "1 link page", included: true },
    { text: "Basic analytics", included: false },
    { text: "Custom domain", included: false },
    { text: "Remove Ultralink badge", included: false },
    { text: "Geo-blocking", included: false },
    { text: "Team members", included: false },
    { text: "Traffic Recovery", included: false },
  ],
};

export const CREATOR_PLAN: CreatorPlan = {
  id: "creator",
  name: "Creator",
  monthlyPrice: 8,
  annualMonthlyPrice: 6,
  annualPrice: 72,
  links: 1,
  users: 1,
  trialDays: 7,
  badge: "Most popular",
  features: [
    { text: "1 link page", included: true },
    { text: "Full analytics", included: true },
    { text: "1 custom domain", included: true },
    { text: "Remove Ultralink badge", included: true },
    { text: "Geo-blocking", included: true },
    { text: "Team members", included: false },
    { text: "Traffic Recovery", included: false },
  ],
};

export const AGENCY_PLAN: AgencyPlan = {
  id: "agency",
  name: "Agency",
  users: "unlimited",
  trialDays: 0,
  badge: "For teams",
  tiers: [
    { links: 10, monthlyPrice: 29, annualMonthlyPrice: 22, annualPrice: 264 },
    { links: 25, monthlyPrice: 49, annualMonthlyPrice: 37, annualPrice: 444 },
    { links: 50, monthlyPrice: 89, annualMonthlyPrice: 67, annualPrice: 804 },
    { links: 100, monthlyPrice: 149, annualMonthlyPrice: 112, annualPrice: 1344 },
    { links: 200, monthlyPrice: 249, annualMonthlyPrice: 187, annualPrice: 2244 },
    { links: 400, monthlyPrice: 399, annualMonthlyPrice: 299, annualPrice: 3588 },
  ],
  features: [
    { text: "Up to 400 link pages", included: true },
    { text: "Full analytics", included: true },
    { text: "1 custom domain per link", included: true },
    { text: "Remove Ultralink badge", included: true },
    { text: "Geo-blocking", included: true },
    { text: "Unlimited team members", included: true },
    { text: "Traffic Recovery", included: true },
  ],
};

export const PLANS = [FREE_PLAN, CREATOR_PLAN, AGENCY_PLAN] as const;

export function getLinkCap(plan: string): number {
  switch (plan) {
    case "creator":
      return CREATOR_PLAN.links;
    case "agency":
      return AGENCY_PLAN.tiers[0].links; // smallest tier (10); Phase 4 will use real tier
    default:
      return FREE_PLAN.links;
  }
}
