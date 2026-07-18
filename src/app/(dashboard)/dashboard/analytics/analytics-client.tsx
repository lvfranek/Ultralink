"use client";

import { useState, useEffect, useTransition, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import { CustomRangePopover, RANGE_OPTIONS, type RangeKey } from "./date-range-picker";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";

interface Page {
  id: string;
  slug: string;
  title: string;
}

interface Props {
  pages: Page[];
  /** When set, renders this static dataset instead of fetching real analytics (Free-plan example view). */
  exampleData?: AnalyticsData;
}

// ─── Date range helpers ───────────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function todayStr(): string {
  return toStr(new Date());
}

function daysAgoStr(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toStr(d);
}

function startOfMonthStr(monthsAgo = 0): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsAgo);
  return toStr(d);
}

function endOfMonthStr(monthsAgo = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo + 1, 0);
  return toStr(d);
}

function getDateRange(
  range: RangeKey,
  customStart: string,
  customEnd: string,
): { start: string; end: string } | null {
  switch (range) {
    case "7d":
      return { start: daysAgoStr(6), end: todayStr() };
    case "30d":
      return { start: daysAgoStr(29), end: todayStr() };
    case "90d":
      return { start: daysAgoStr(89), end: todayStr() };
    case "thisMonth":
      return { start: startOfMonthStr(0), end: todayStr() };
    case "lastMonth":
      return { start: startOfMonthStr(1), end: endOfMonthStr(1) };
    case "custom":
      if (!customStart || !customEnd) return null;
      return { start: customStart, end: customEnd };
  }
}

function calcDelta(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((current - prev) / prev) * 100);
}

function fmtDelta(delta: number): string {
  const sign = delta >= 0 ? "+" : "-";
  const abs = Math.abs(delta);
  return abs > 999 ? `${sign}>999%` : `${sign}${abs}%`;
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

/** Mirrors the server's previous-period calculation so we can label it client-side. */
function prevPeriod(startStr: string, endStr: string): { prevStart: Date; prevEnd: Date } {
  const startDate = new Date(`${startStr}T00:00:00`);
  const endDate = new Date(`${endStr}T23:59:59.999`);
  const rangeMs = endDate.getTime() - startDate.getTime();
  const prevEnd = new Date(startDate.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - rangeMs);
  return { prevStart, prevEnd };
}

function formatDateRangeLabel(from: Date, to: Date): string {
  const sameYear = from.getFullYear() === to.getFullYear();
  const sameMonth = sameYear && from.getMonth() === to.getMonth();
  const monthFmt = new Intl.DateTimeFormat("en-US", { month: "short" });
  if (sameMonth) {
    return `${monthFmt.format(from)} ${from.getDate()} – ${to.getDate()}, ${to.getFullYear()}`;
  }
  const fullFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fullFmt.format(from)} – ${fullFmt.format(to)}`;
}

function prevPeriodLabel(range: RangeKey, startStr: string, endStr: string): string {
  if (range === "7d") return "vs previous 7 days";
  if (range === "30d") return "vs previous 30 days";
  if (range === "90d") return "vs previous 90 days";
  const { prevStart, prevEnd } = prevPeriod(startStr, endStr);
  return `vs ${formatDateRangeLabel(prevStart, prevEnd)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`ul-analytics-tile rounded-[14px] border p-5 transition-colors duration-200 ${className}`}
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

function Delta({ current, prev, periodLabel }: { current: number; prev: number; periodLabel: string }) {
  const delta = calcDelta(current, prev);
  if (delta === null) {
    return <span className="text-xs font-medium" style={{ color: "#9A9A9A" }}>New</span>;
  }
  const positive = delta >= 0;
  return (
    <div>
      <span className="text-xs font-medium" style={{ color: positive ? "#4ADE80" : "#F87171" }}>
        {fmtDelta(delta)}
      </span>
      <p className="text-[10px] mt-0.5" style={{ color: "#9A9A9A" }}>{periodLabel}</p>
    </div>
  );
}

function SegmentedPill<T extends string>({
  options,
  value,
  onChange,
  customSlot,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  customSlot?: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center p-[3px] rounded-full gap-0.5 overflow-x-auto no-scrollbar max-w-[calc(100vw-32px)] sm:max-w-none"
      style={{
        background: "#2A2A2A",
        border: "1px solid rgba(255,255,255,.08)",
        whiteSpace: "nowrap",
      }}
    >
      {options.map((opt) =>
        opt.value === "custom" && customSlot ? (
          <div key={opt.value} className="shrink-0">{customSlot}</div>
        ) : (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer shrink-0"
            style={
              value === opt.value
                ? { background: "#ffffff", color: "#000000" }
                : { color: "#9A9A9A" }
            }
          >
            {opt.label}
          </button>
        )
      )}
    </div>
  );
}

// ─── Charts ───────────────────────────────────────────────────────────────────

const PIE_COLORS = [
  "#A78BFA", // lavender — Ultralink brand
  "rgba(255,255,255,.8)", // white variant
  "#4ADE80", // soft green
  "#06AEEF", // Glacier blue
  "#F87171", // soft red
  "rgba(255,255,255,.35)", // Other
];

function ActivityTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey?: string; value?: number }[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 10,
        padding: 12,
        fontSize: 12,
      }}
    >
      <p style={{ color: "#ffffff", marginBottom: 6, fontWeight: 500 }}>
        {shortDate(String(label))}
      </p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5" style={{ marginTop: 2 }}>
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: p.dataKey === "views" ? "#A78BFA" : "#ffffff" }}
          />
          <span style={{ color: "#ffffff" }}>
            {p.dataKey === "views" ? "Views" : "Clicks"}: {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

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
            <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
        <XAxis
          dataKey="date"
          ticks={filteredTicks}
          tickFormatter={shortDate}
          tick={{ fill: "#9A9A9A", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#9A9A9A", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          content={<ActivityTooltip />}
        />
        <Area
          type="monotone"
          dataKey="views"
          stroke="#A78BFA"
          strokeWidth={2}
          fill="url(#viewsGrad)"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="clicks"
          stroke="#ffffff"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: "#ffffff", stroke: "#ffffff" }}
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

function AnalyticsDashboardInner({ pages, exampleData }: Props) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id ?? "");
  const [range, setRange] = useState<RangeKey>("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hydrated, setHydrated] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [mobileCustomOpen, setMobileCustomOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 640);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Hydrate from URL, then localStorage (per-page), then default.
  useEffect(() => {
    const urlPage = searchParams.get("page");
    const urlRange = searchParams.get("range") as RangeKey | null;
    const urlFrom = searchParams.get("from");
    const urlTo = searchParams.get("to");

    let pageId = pages[0]?.id ?? "";
    if (urlPage && pages.some((p) => p.id === urlPage)) {
      pageId = urlPage;
    } else {
      const stored = localStorage.getItem("ul_analytics_page");
      if (stored && pages.some((p) => p.id === stored)) pageId = stored;
    }
    setSelectedPageId(pageId);

    if (urlRange && RANGE_OPTIONS.some((o) => o.value === urlRange)) {
      setRange(urlRange);
      if (urlRange === "custom" && urlFrom && urlTo) {
        setCustomStart(urlFrom);
        setCustomEnd(urlTo);
      }
    } else {
      const storedRange = localStorage.getItem(`ul_analytics_range_${pageId}`);
      if (storedRange) {
        try {
          const parsed = JSON.parse(storedRange);
          if (parsed.range) setRange(parsed.range);
          if (parsed.customStart) setCustomStart(parsed.customStart);
          if (parsed.customEnd) setCustomEnd(parsed.customEnd);
        } catch {
          // ignore invalid stored value
        }
      }
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist selected page + range, and sync URL.
  useEffect(() => {
    if (!hydrated || !selectedPageId) return;
    localStorage.setItem("ul_analytics_page", selectedPageId);
    localStorage.setItem(
      `ul_analytics_range_${selectedPageId}`,
      JSON.stringify({ range, customStart, customEnd })
    );

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", selectedPageId);
    params.set("range", range);
    if (range === "custom" && customStart && customEnd) {
      params.set("from", customStart);
      params.set("to", customEnd);
    } else {
      params.delete("from");
      params.delete("to");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, selectedPageId, range, customStart, customEnd]);

  // Fetch on change — skipped entirely in example mode, where the same static dataset is reused.
  useEffect(() => {
    if (exampleData) {
      setData(exampleData);
      return;
    }
    if (!hydrated || !selectedPageId) return;
    const dates = getDateRange(range, customStart, customEnd);
    if (!dates) return;

    startTransition(async () => {
      const result = await getAnalyticsData(selectedPageId, dates.start, dates.end);
      setData(result);
    });
  }, [exampleData, hydrated, selectedPageId, range, customStart, customEnd]);

  const handleCustomApply = useCallback((r: { from?: Date; to?: Date }) => {
    if (!r.from || !r.to) return;
    setCustomStart(toStr(r.from));
    setCustomEnd(toStr(r.to));
    setRange("custom");
  }, []);

  const loading = isPending || !hydrated;

  if (!pages.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm" style={{ color: "#6B6B6B" }}>
          Create a link page first to see analytics.
        </p>
      </div>
    );
  }

  const dates = getDateRange(range, customStart, customEnd);
  const periodLabel = dates ? prevPeriodLabel(range, dates.start, dates.end) : "";
  const customSummary =
    range === "custom" && customStart && customEnd
      ? formatDateRangeLabel(new Date(`${customStart}T00:00:00`), new Date(`${customEnd}T00:00:00`))
      : null;

  return (
    <div className="min-h-full" style={{ background: "#131313" }}>
      {exampleData && (
        <div
          className="sticky top-0 z-10 flex flex-wrap items-center gap-3 px-4 sm:px-6 py-3"
          style={{
            background: "linear-gradient(to right, rgba(167,139,250,.15), rgba(6,174,239,.1))",
            borderBottom: "1px solid rgba(255,255,255,.10)",
            backdropFilter: "blur(8px)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.75"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.584 10.587a2 2 0 002.829 2.83M9.363 5.365A9.466 9.466 0 0112 5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.61 6.61C4.507 8.005 2.9 10.07 1.935 12.5 3.226 16.836 7.244 20 12 20a9.46 9.46 0 004.635-1.225" />
          </svg>
          <p className="text-xs sm:text-sm font-medium flex-1 min-w-0" style={{ color: "#ffffff" }}>
            This is example data. Upgrade to Pro to see your real analytics.
          </p>
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="shrink-0 inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-xs font-semibold transition-opacity hover:opacity-85"
            style={{ background: "#ffffff", color: "#000000" }}
          >
            Upgrade to Pro →
          </button>
        </div>
      )}

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-2xl font-bold flex-1" style={{ color: "#ffffff" }}>
            Analytics
          </h1>
          <div className="flex flex-col items-end gap-1.5">
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
              {isMobile ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      value={range}
                      onChange={(e) => {
                        const val = e.target.value as RangeKey;
                        if (val === "custom") {
                          setMobileCustomOpen(true);
                        } else {
                          setRange(val);
                        }
                      }}
                      className="h-8 pl-3 pr-8 text-xs rounded-full cursor-pointer appearance-none"
                      style={{
                        background: "#2A2A2A",
                        border: "1px solid rgba(255,255,255,.08)",
                        color: "#ffffff",
                        outline: "none",
                      }}
                    >
                      {RANGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] text-[#9A9A9A]">
                      ▼
                    </span>
                  </div>

                  {range === "custom" && (
                    <button
                      type="button"
                      onClick={() => setMobileCustomOpen(true)}
                      className="h-8 px-3 rounded-full flex items-center gap-1 cursor-pointer transition-colors text-xs font-medium"
                      style={{
                        background: "#2A2A2A",
                        border: "1px solid rgba(255,255,255,.08)",
                        color: "#ffffff",
                      }}
                      aria-label="Edit custom range"
                    >
                      <span>✏️</span>
                      <span>Edit</span>
                    </button>
                  )}

                  {mobileCustomOpen && (
                    <CustomRangePopover
                      value={
                        customStart && customEnd
                          ? { from: new Date(`${customStart}T00:00:00`), to: new Date(`${customEnd}T00:00:00`) }
                          : undefined
                      }
                      onApply={(r) => {
                        handleCustomApply(r);
                        setMobileCustomOpen(false);
                      }}
                      defaultOpen={true}
                      onClose={() => setMobileCustomOpen(false)}
                    />
                  )}
                </div>
              ) : (
                <SegmentedPill
                  options={RANGE_OPTIONS}
                  value={range}
                  onChange={setRange}
                  customSlot={
                    <CustomRangePopover
                      value={
                        customStart && customEnd
                          ? { from: new Date(`${customStart}T00:00:00`), to: new Date(`${customEnd}T00:00:00`) }
                          : undefined
                      }
                      onApply={handleCustomApply}
                    />
                  }
                />
              )}
            </div>
            {range === "custom" && customSummary && (
              <p className="text-xs" style={{ color: "#6B6B6B" }}>{customSummary}</p>
            )}
          </div>
        </div>

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
                className="text-2xl font-bold mb-1 flex items-center gap-2"
                style={{ color: loading ? "#3A3A3A" : "#ffffff" }}
              >
                {typeof tile.value === "number" ? fmt(tile.value) : tile.value}
                {exampleData && !loading && (
                  <span
                    className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(167,139,250,.18)", color: "#A78BFA" }}
                  >
                    Example
                  </span>
                )}
              </p>
              {!tile.noCompare && !loading && (
                <Delta
                  current={"rawCurrent" in tile ? (tile.rawCurrent ?? 0) : (tile.value as number)}
                  prev={"rawPrev" in tile ? (tile.rawPrev ?? 0) : tile.prev!}
                  periodLabel={periodLabel}
                />
              )}
              {tile.label === "Clicks" && !loading && (data?.winbackShown ?? 0) > 0 && (() => {
                const rate = data!.winbackShown > 0
                  ? Math.round((data!.winbackClicks / data!.winbackShown) * 100)
                  : 0;
                return (
                  <p className="text-[11px] mt-1.5 leading-relaxed" style={{ color: "#9A9A9A" }}>
                    Win-Back: {fmt(data!.winbackShown)} shown · {fmt(data!.winbackClicks)} recovered (
                    <span style={{ color: rate > 0 ? "#A78BFA" : "#9A9A9A" }}>{rate}%</span>)
                  </p>
                );
              })()}
            </Card>
          ))}
        </div>

        {/* ── Activity chart ── */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Activity</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#A78BFA" }} />
                <span className="text-xs" style={{ color: "#6B6B6B" }}>Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ffffff" }} />
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
                    <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "transparent" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.pct}%`, background: "rgba(167,139,250,.25)" }}
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
                const fill =
                  key === "mobile" ? "#A78BFA" : key === "desktop" ? "rgba(255,255,255,.5)" : "rgba(167,139,250,.25)";
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
                        style={{ width: `${pct}%`, background: fill }}
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
                  <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: "#ffffff" }}>
                    {fmt(link.clicks)}
                  </span>
                  <span className="text-xs tabular-nums shrink-0 w-8 text-right" style={{ color: "#9A9A9A" }}>
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

export function AnalyticsDashboard({ pages, exampleData }: Props) {
  return (
    <Suspense fallback={<div className="min-h-full" style={{ background: "#131313" }} />}>
      <AnalyticsDashboardInner pages={pages} exampleData={exampleData} />
    </Suspense>
  );
}
