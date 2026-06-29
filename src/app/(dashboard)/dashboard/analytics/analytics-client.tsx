"use client";

import { useState, useEffect, useTransition } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAnalyticsData, type AnalyticsData } from "@/app/actions/analytics";
import { getCountryName, flagEmoji } from "@/lib/countries";

interface Page {
  id: string;
  slug: string;
  title: string;
}

interface Props {
  pages: Page[];
}

// ─── Date range helpers ───────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function getDateRange(
  range: "7d" | "30d" | "custom",
  customStart: string,
  customEnd: string,
): { start: string; end: string } | null {
  if (range === "custom") {
    if (!customStart || !customEnd) return null;
    return { start: customStart, end: customEnd };
  }
  return {
    start: daysAgoStr(range === "7d" ? 6 : 29),
    end: todayStr(),
  };
}

function calcDelta(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((current - prev) / prev) * 100);
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${+m}/${+d}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function Delta({ current, prev }: { current: number; prev: number }) {
  const delta = calcDelta(current, prev);
  if (delta === null) return <span className="text-xs" style={{ color: "#6B6B6B" }}>—</span>;
  const positive = delta >= 0;
  return (
    <span className="text-xs font-medium" style={{ color: positive ? "#4ade80" : "#f87171" }}>
      {positive ? "+" : ""}{delta}%
    </span>
  );
}

function SegmentedPill<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      className="flex items-center p-[3px] rounded-full gap-0.5"
      style={{ background: "#2A2A2A", border: "1px solid rgba(255,255,255,.08)" }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer"
          style={
            value === opt.value
              ? { background: "#ffffff", color: "#000000" }
              : { color: "#9A9A9A" }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

const PIE_COLORS = ["#ffffff", "#C9A86A", "#6B6B6B", "#4A4A4A", "#3A3A3A", "#2E2E2E", "#252525"];

function ActivityChart({ data, loading }: { data: AnalyticsData | null; loading: boolean }) {
  if (loading || !data) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <span className="text-xs" style={{ color: "#6B6B6B" }}>Loading…</span>
      </div>
    );
  }

  const showTicks = data.timeseries.length <= 14;
  const filteredTicks = showTicks
    ? data.timeseries.map((d) => d.date)
    : data.timeseries
        .filter((_, i) => i % Math.ceil(data.timeseries.length / 7) === 0)
        .map((d) => d.date);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data.timeseries} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,.05)" />
        <XAxis
          dataKey="date"
          ticks={filteredTicks}
          tickFormatter={shortDate}
          tick={{ fill: "#6B6B6B", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6B6B6B", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1A1A1A",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 8,
            fontSize: 12,
            color: "#ffffff",
          }}
          labelFormatter={(label) => shortDate(String(label))}
          formatter={(value, name) => [
            value,
            name === "views" ? "Views" : "Clicks",
          ]}
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke="#ffffff"
          strokeWidth={1.5}
          fill="url(#viewsGrad)"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="clicks"
          stroke="#C9A86A"
          strokeWidth={1.5}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function SourcesDonut({ sources }: { sources: AnalyticsData["sources"] }) {
  if (!sources.length) {
    return (
      <div className="flex items-center justify-center h-[140px]">
        <span className="text-xs" style={{ color: "#6B6B6B" }}>No data</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <PieChart width={140} height={140}>
          <Pie
            data={sources}
            dataKey="count"
            cx="50%"
            cy="50%"
            innerRadius={44}
            outerRadius={64}
            paddingAngle={2}
            strokeWidth={0}
          >
            {sources.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </div>
      <div className="space-y-1.5">
        {sources.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span className="text-xs flex-1 truncate" style={{ color: "#9A9A9A" }}>
              {s.label}
            </span>
            <span className="text-xs font-medium" style={{ color: "#ffffff" }}>
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalyticsDashboard({ pages }: Props) {
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id ?? "");
  const [range, setRange] = useState<"7d" | "30d" | "custom">("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isPending, startTransition] = useTransition();

  // Persist selected page
  useEffect(() => {
    const stored = localStorage.getItem("ul_analytics_page");
    if (stored && pages.some((p) => p.id === stored)) setSelectedPageId(stored);
  }, [pages]);

  useEffect(() => {
    if (selectedPageId) localStorage.setItem("ul_analytics_page", selectedPageId);
  }, [selectedPageId]);

  // Fetch on change
  useEffect(() => {
    if (!selectedPageId) return;
    const dates = getDateRange(range, customStart, customEnd);
    if (!dates) return;

    startTransition(async () => {
      const result = await getAnalyticsData(selectedPageId, dates.start, dates.end);
      setData(result);
    });
  }, [selectedPageId, range, customStart, customEnd]);

  const loading = isPending;

  if (!pages.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm" style={{ color: "#6B6B6B" }}>
          Create a link page first to see analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full" style={{ background: "#131313" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-2xl font-bold flex-1" style={{ color: "#ffffff" }}>
            Analytics
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {/* Page selector */}
            {pages.length > 1 && (
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="h-8 px-3 text-xs rounded-full cursor-pointer"
                style={{
                  background: "#2A2A2A",
                  border: "1px solid rgba(255,255,255,.08)",
                  color: "#ffffff",
                  outline: "none",
                }}
              >
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title || p.slug}
                  </option>
                ))}
              </select>
            )}

            {/* Range selector */}
            <SegmentedPill
              options={[
                { label: "7 days", value: "7d" },
                { label: "30 days", value: "30d" },
                { label: "Custom", value: "custom" },
              ]}
              value={range}
              onChange={setRange}
            />
          </div>
        </div>

        {/* Custom date pickers */}
        {range === "custom" && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-8 px-3 text-xs rounded-lg"
              style={{
                background: "#2A2A2A",
                border: "1px solid rgba(255,255,255,.08)",
                color: "#ffffff",
                outline: "none",
              }}
            />
            <span className="text-xs" style={{ color: "#6B6B6B" }}>to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-8 px-3 text-xs rounded-lg"
              style={{
                background: "#2A2A2A",
                border: "1px solid rgba(255,255,255,.08)",
                color: "#ffffff",
                outline: "none",
              }}
            />
          </div>
        )}

        {/* ── Headline tiles ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Views", value: data?.views ?? 0, prev: data?.prevViews ?? 0 },
            { label: "Clicks", value: data?.clicks ?? 0, prev: data?.prevClicks ?? 0 },
            {
              label: "CTR",
              value: `${data?.ctr ?? 0}%`,
              rawCurrent: data?.ctr ?? 0,
              rawPrev: data?.prevCtr ?? 0,
              isCtr: true,
            },
            { label: "Active Links", value: data?.activeLinks ?? 0, noCompare: true },
          ].map((tile) => (
            <Card key={tile.label}>
              <p className="text-xs mb-1" style={{ color: "#6B6B6B" }}>
                {tile.label}
              </p>
              <p
                className="text-2xl font-bold mb-1"
                style={{ color: loading ? "#3A3A3A" : "#ffffff" }}
              >
                {typeof tile.value === "number" ? fmt(tile.value) : tile.value}
              </p>
              {!tile.noCompare && !loading && (
                <Delta
                  current={"rawCurrent" in tile ? (tile.rawCurrent ?? 0) : (tile.value as number)}
                  prev={"rawPrev" in tile ? (tile.rawPrev ?? 0) : tile.prev!}
                />
              )}
            </Card>
          ))}
        </div>

        {/* ── Activity chart ── */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Activity</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ffffff" }} />
                <span className="text-xs" style={{ color: "#6B6B6B" }}>Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#C9A86A" }} />
                <span className="text-xs" style={{ color: "#6B6B6B" }}>Clicks</span>
              </div>
            </div>
          </div>
          <ActivityChart data={data} loading={loading} />
        </Card>

        {/* ── Countries + Sources ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Countries */}
          <Card>
            <CardTitle>Top Countries</CardTitle>
            {loading || !data ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-5 rounded" style={{ background: "#2A2A2A" }} />
                ))}
              </div>
            ) : data.countries.length === 0 ? (
              <p className="text-xs" style={{ color: "#6B6B6B" }}>No data yet.</p>
            ) : (
              <div className="space-y-2">
                {data.countries.map((c) => (
                  <div key={c.code} className="flex items-center gap-2.5">
                    <span className="text-base leading-none w-5 text-center">{flagEmoji(c.code)}</span>
                    <span className="text-xs flex-1 truncate" style={{ color: "#9A9A9A" }}>
                      {c.code === "Unknown" ? "Unknown" : getCountryName(c.code)}
                    </span>
                    <span className="text-xs font-medium tabular-nums" style={{ color: "#ffffff" }}>
                      {fmt(c.count)}
                    </span>
                    <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "#2A2A2A" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.pct}%`, background: "#ffffff" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Sources */}
          <Card>
            <CardTitle>Traffic Sources</CardTitle>
            {loading || !data ? (
              <div className="h-[200px] flex items-center justify-center">
                <span className="text-xs" style={{ color: "#6B6B6B" }}>Loading…</span>
              </div>
            ) : (
              <SourcesDonut sources={data.sources} />
            )}
          </Card>
        </div>

        {/* ── Devices ── */}
        <Card>
          <CardTitle>Devices</CardTitle>
          {loading || !data || data.devices.total === 0 ? (
            <p className="text-xs" style={{ color: "#6B6B6B" }}>
              {loading ? "Loading…" : "No data yet."}
            </p>
          ) : (
            <div className="space-y-3">
              {(
                [
                  { key: "mobile", label: "Mobile" },
                  { key: "desktop", label: "Desktop" },
                  { key: "tablet", label: "Tablet" },
                ] as const
              ).map(({ key, label }) => {
                const count = data.devices[key];
                const pct =
                  data.devices.total > 0
                    ? Math.round((count / data.devices.total) * 100)
                    : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "#9A9A9A" }}>
                        {label}
                      </span>
                      <span className="text-xs font-medium tabular-nums" style={{ color: "#ffffff" }}>
                        {fmt(count)} · {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#2A2A2A" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: "#ffffff" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* ── Top links ── */}
        <Card>
          <CardTitle>Top Links</CardTitle>
          {loading || !data ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg" style={{ background: "#2A2A2A" }} />
              ))}
            </div>
          ) : data.topLinks.length === 0 ? (
            <p className="text-xs" style={{ color: "#6B6B6B" }}>No clicks tracked yet.</p>
          ) : (
            <div className="space-y-1">
              {data.topLinks.map((link, i) => (
                <div
                  key={link.link_id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.02)" }}
                >
                  <span className="text-xs w-4 text-right shrink-0" style={{ color: "#6B6B6B" }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "#ffffff" }}>
                      {link.label || "Untitled"}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: "#6B6B6B" }}>
                      {link.url}
                    </p>
                  </div>
                  <span className="text-xs font-medium tabular-nums shrink-0" style={{ color: "#ffffff" }}>
                    {fmt(link.clicks)}
                  </span>
                  <span className="text-xs tabular-nums shrink-0 w-8 text-right" style={{ color: "#6B6B6B" }}>
                    {link.pct}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
