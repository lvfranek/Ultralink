import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminStats } from "@/lib/admin/stats";

export const dynamic = "force-dynamic";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[14px] border p-5 ${className}`}
      style={{ background: "#1A1A1A", borderColor: "rgba(255,255,255,.08)" }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#6B6B6B" }}>
      {children}
    </p>
  );
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function PlanBadge({ tier, status }: { tier: number | null; status: string }) {
  const isPro = tier !== null && ["active", "trialing", "grace"].includes(status);
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
      style={{
        color: isPro ? "#C9A86A" : "#9A9A9A",
        border: isPro ? "1px solid rgba(201,168,106,0.3)" : "1px solid rgba(255,255,255,.08)",
        background: isPro ? "rgba(201,168,106,0.08)" : "rgba(255,255,255,0.04)",
      }}
    >
      {isPro ? `Pro (${tier})` : "Free"}
    </span>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ revalidate?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminId = process.env.ADMIN_USER_ID;
  if (!user || !adminId || user.id !== adminId) {
    notFound();
  }

  const { revalidate } = await searchParams;
  if (revalidate) revalidatePath("/admin");

  const stats = await getAdminStats();

  const tiles = [
    { label: "Total users", value: stats.totalUsers.toLocaleString() },
    {
      label: "Pro users",
      value: stats.totalPro.toLocaleString(),
      sub: `${stats.conversionRate.toFixed(1)}% conversion`,
    },
    { label: "Free users", value: stats.totalFree.toLocaleString() },
    { label: "MRR", value: fmtMoney(stats.mrr), sub: `~${fmtMoney(stats.arr)} ARR` },
    {
      label: "Health",
      value: `Grace: ${stats.graceCount} · Canceled: ${stats.canceledCount}`,
      small: true,
    },
  ];

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-6 max-w-[1200px] mx-auto w-full overflow-y-auto">
      <h1 className="text-xl font-semibold text-white">Admin</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <p className="text-xs mb-1" style={{ color: "#6B6B6B" }}>
              {tile.label}
            </p>
            <p
              className={tile.small ? "text-sm font-medium" : "text-2xl font-bold"}
              style={{ color: "#ffffff" }}
            >
              {tile.value}
            </p>
            {tile.sub && (
              <p className="text-xs mt-1" style={{ color: "#6B6B6B" }}>
                {tile.sub}
              </p>
            )}
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>Tier distribution</CardTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: "#6B6B6B" }} className="text-left text-xs uppercase tracking-wide">
                <th className="pb-2 pr-4 font-medium">Tier</th>
                <th className="pb-2 pr-4 font-medium">Monthly</th>
                <th className="pb-2 pr-4 font-medium">Annual</th>
                <th className="pb-2 pr-4 font-medium">Total</th>
                <th className="pb-2 font-medium">MRR</th>
              </tr>
            </thead>
            <tbody>
              {stats.tierBreakdown.map((row) => (
                <tr key={row.tier} style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
                  <td className="py-2 pr-4 text-white">{row.tier}</td>
                  <td className="py-2 pr-4 text-white">{row.monthlyCustomers}</td>
                  <td className="py-2 pr-4 text-white">{row.annualCustomers}</td>
                  <td className="py-2 pr-4 text-white">{row.total}</td>
                  <td className="py-2 text-white">{fmtMoney(row.mrr)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,.12)" }} className="font-semibold">
                <td className="py-2 pr-4 text-white">Total</td>
                <td className="py-2 pr-4 text-white">
                  {stats.tierBreakdown.reduce((s, r) => s + r.monthlyCustomers, 0)}
                </td>
                <td className="py-2 pr-4 text-white">
                  {stats.tierBreakdown.reduce((s, r) => s + r.annualCustomers, 0)}
                </td>
                <td className="py-2 pr-4 text-white">{stats.totalPro}</td>
                <td className="py-2 text-white">{fmtMoney(stats.mrr)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <Card>
        <CardTitle>Recent signups (last 7 days)</CardTitle>
        {stats.recentSignups.length === 0 ? (
          <p className="text-sm" style={{ color: "#6B6B6B" }}>No signups in the last 7 days.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {stats.recentSignups.map((s) => (
              <div key={s.username} className="flex items-center justify-between text-sm">
                <span className="text-white truncate">{s.username}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span style={{ color: "#6B6B6B" }}>{formatRelativeTime(s.created_at)}</span>
                  <PlanBadge tier={s.plan_tier} status={s.subscription_status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
