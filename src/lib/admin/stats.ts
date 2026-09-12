import { createServiceClient } from "@/lib/supabase/service";
import { TIERS, getMonthlyEquivalentPrice, type Tier } from "@/lib/config/pricing";
import type { SubscriptionStatus } from "@/lib/supabase/types";

const ACTIVE_STATUSES: SubscriptionStatus[] = ["active", "trialing", "grace"];

export async function getUserCount(): Promise<number> {
  const service = createServiceClient();
  const { count } = await service
    .from("profiles")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export interface TierBreakdownRow {
  tier: Tier;
  monthlyCustomers: number;
  annualCustomers: number;
  total: number;
  mrr: number;
}

export interface AdminStats {
  totalUsers: number;
  totalPro: number;
  totalFree: number;
  mrr: number;
  arr: number;
  conversionRate: number;
  graceCount: number;
  canceledCount: number;
  tierBreakdown: TierBreakdownRow[];
  recentSignups: {
    username: string;
    created_at: string;
    plan_tier: number | null;
    subscription_status: SubscriptionStatus;
  }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const service = createServiceClient();

  const [
    { count: totalUsers },
    { data: proBreakdown },
    { data: recentSignups },
    { count: graceCount },
    { count: canceledCount },
  ] = await Promise.all([
    service.from("profiles").select("*", { count: "exact", head: true }),
    service
      .from("profiles")
      .select("id, plan_tier, plan_interval, subscription_status")
      .in("subscription_status", ACTIVE_STATUSES),
    service
      .from("profiles")
      .select("username, created_at, plan_tier, subscription_status")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(20),
    service.from("profiles").select("*", { count: "exact", head: true }).eq("subscription_status", "grace"),
    service.from("profiles").select("*", { count: "exact", head: true }).eq("subscription_status", "canceled"),
  ]);

  // The admin account has Pro for free — it's not a paying customer, so keep
  // it out of revenue and conversion numbers.
  const adminId = process.env.ADMIN_USER_ID;
  const breakdown = (proBreakdown ?? []).filter((r) => r.id !== adminId);
  const excludedAdmin = (proBreakdown?.length ?? 0) - breakdown.length;
  const tierBreakdown: TierBreakdownRow[] = TIERS.map((tier) => {
    const rows = breakdown.filter((r) => r.plan_tier === tier);
    const monthlyCustomers = rows.filter((r) => r.plan_interval === "monthly").length;
    const annualCustomers = rows.filter((r) => r.plan_interval === "annual").length;
    const mrr = rows.reduce((sum, r) => sum + getMonthlyEquivalentPrice(tier, r.plan_interval), 0);
    return { tier, monthlyCustomers, annualCustomers, total: monthlyCustomers + annualCustomers, mrr };
  });

  const mrr = tierBreakdown.reduce((sum, row) => sum + row.mrr, 0);
  const totalPro = breakdown.length;
  const total = (totalUsers ?? 0) - excludedAdmin;

  return {
    totalUsers: total,
    totalPro,
    totalFree: total - totalPro,
    mrr: Math.round(mrr * 100) / 100,
    arr: Math.round(mrr * 12 * 100) / 100,
    conversionRate: total > 0 ? (totalPro / total) * 100 : 0,
    graceCount: graceCount ?? 0,
    canceledCount: canceledCount ?? 0,
    tierBreakdown,
    recentSignups: recentSignups ?? [],
  };
}
