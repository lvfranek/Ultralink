"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Eye,
  Globe,
  Layers,
  Link2,
  Loader2,
  Monitor,
  MousePointerClick,
  Percent,
  Smartphone,
  Sparkles,
  Tablet,
} from "lucide-react";
import { getAnalyticsData, type AnalyticsData } from "@/app/actions/analytics";
import { getCountryName, flagEmoji } from "@/lib/countries";
import { getPlatform } from "@/lib/config/socials";
import { useUpgradeModal } from "@/components/app/upgrade-context";
import {
  BrandIcon,
  cx,
  Delta,
  RainbowBorder,
  Segmented,
  Sparkline,
  spotlight,
  useCountUp,
  usePopover,
} from "@/components/app/ui";
import s from "@/components/app/app.module.css";

interface PageOption {
  id: string;
  slug: string;
  title: string;
}

// ─── Date ranges ─────────────────────────────────────────────────────────────

type RangeKey = "7d" | "30d" | "90d" | "thisMonth" | "lastMonth" | "custom";

const pad = (n: number) => String(n).padStart(2, "0");
const toStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toStr(d);
};
const monthStart = (back: number) => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - back);
  return toStr(d);
};
const monthEnd = (back: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - back + 1, 0);
  return toStr(d);
};

function rangeDates(key: RangeKey, custom: { start: string; end: string }) {
  switch (key) {
    case "7d":
      return { start: daysAgo(6), end: toStr(new Date()) };
    case "30d":
      return { start: daysAgo(29), end: toStr(new Date()) };
    case "90d":
      return { start: daysAgo(89), end: toStr(new Date()) };
    case "thisMonth":
      return { start: monthStart(0), end: toStr(new Date()) };
    case "lastMonth":
      return { start: monthStart(1), end: monthEnd(1) };
    case "custom":
      return custom;
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (iso: string) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
};

function rangeLabel(key: RangeKey, custom: { start: string; end: string }) {
  return {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    thisMonth: "This month",
    lastMonth: "Last month",
    custom: `${dayLabel(custom.start)} – ${dayLabel(custom.end)}`,
  }[key];
}

const compact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return Math.round(n).toLocaleString("en-US");
};
const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

// ─── View ────────────────────────────────────────────────────────────────────

export function AnalyticsView({
  pages,
  initialPage,
  exampleData,
}: {
  pages: PageOption[];
  initialPage: string;
  /** Free plans see this static example instead of their own numbers */
  exampleData?: AnalyticsData;
}) {
  const openUpgrade = useUpgradeModal();
  const [pageId, setPageId] = useState(pages.some((p) => p.id === initialPage) ? initialPage : "all");
  const [range, setRange] = useState<RangeKey>("30d");
  const [custom, setCustom] = useState({ start: daysAgo(13), end: toStr(new Date()) });
  const [loaded, setLoaded] = useState<{ key: string; data: AnalyticsData | null } | null>(null);

  const dates = rangeDates(range, custom);
  const key = `${pageId}|${dates.start}|${dates.end}`;

  useEffect(() => {
    if (exampleData || pages.length === 0) return;
    let cancelled = false;
    void getAnalyticsData(pageId, dates.start, dates.end).then((data) => {
      if (!cancelled) setLoaded({ key, data });
    });
    return () => {
      cancelled = true;
    };
  }, [exampleData, pages.length, pageId, dates.start, dates.end, key]);

  const data = exampleData ?? loaded?.data ?? null;
  const loading = !exampleData && loaded?.key !== key;
  const failed = !exampleData && !loading && !loaded?.data;
  const page = pages.find((p) => p.id === pageId);
  const vs = "vs previous period";

  return (
    <>
      <div className={cx(s.pageHead, s.enter)}>
        <h1 className={s.h1}>
          Know your <span className={s.serif}>audience.</span>
        </h1>
        <div className={cx(s.controls, exampleData && s.controlsOff)} inert={!!exampleData}>
          {loading && data && <Loader2 size={16} className={s.spin} aria-label="Loading" />}
          <PagePicker pages={pages} value={pageId} onChange={setPageId} />
          <RangePicker value={range} custom={custom} onChange={setRange} onCustom={setCustom} />
        </div>
      </div>

      {exampleData && (
        <RainbowBorder className={cx(s.banner, s.enter)}>
          <Sparkles size={18} aria-hidden="true" style={{ color: "var(--pink)", flexShrink: 0 }} />
          <p className={s.bannerText} style={{ margin: 0 }}>
            <strong>You&apos;re looking at example data.</strong> Upgrade to Pro to see your real visitors, clicks and
            countries.
          </p>
          <button type="button" className={cx(s.btnLight, s.btnSm)} onClick={openUpgrade}>
            Upgrade to Pro
          </button>
        </RainbowBorder>
      )}

      {pages.length === 0 ? (
        <div className={cx(s.empty, s.enter)}>
          <h2 className={s.emptyTitle}>No pages yet.</h2>
          <p className={s.emptySub}>Create your first link page, and its visitors show up here.</p>
        </div>
      ) : failed ? (
        <div className={s.analyticsLoading}>Couldn&apos;t load analytics. Please reload the page.</div>
      ) : !data ? (
        <div className={s.analyticsLoading}>
          <Loader2 size={20} className={s.spin} aria-hidden="true" /> Loading analytics…
        </div>
      ) : (
        <div className={cx(s.analyticsBody, loading && s.analyticsStale)} aria-busy={loading}>
          <Report data={data} page={page} rangeText={rangeLabel(range, custom)} vs={vs} chartKey={key} />
        </div>
      )}
    </>
  );
}

function Report({
  data,
  page,
  rangeText,
  vs,
  chartKey,
}: {
  data: AnalyticsData;
  page: PageOption | undefined;
  rangeText: string;
  vs: string;
  chartKey: string;
}) {
  const points = data.timeseries.map((t) => ({
    label: dayLabel(t.date),
    views: t.views,
    clicks: t.clicks,
    ctr: t.views ? (t.clicks / t.views) * 100 : 0,
  }));
  const winbackRate = data.winbackShown ? data.winbackClicks / data.winbackShown : 0;
  const deviceTotal = data.devices.total || 1;
  const devices = [
    { id: "mobile", label: "Mobile", count: data.devices.mobile, color: "#f7a8c4", Icon: Smartphone },
    { id: "desktop", label: "Desktop", count: data.devices.desktop, color: "#c9a7f2", Icon: Monitor },
    { id: "tablet", label: "Tablet", count: data.devices.tablet, color: "#a7c7f7", Icon: Tablet },
  ];

  return (
    <>
      <div className={s.kpis}>
        <Kpi
          icon={<Eye size={15} />}
          label="Views"
          value={data.views}
          prev={data.prevViews}
          format={compact}
          vs={vs}
          spark={points.map((p) => p.views)}
          delay={0}
        />
        <Kpi
          icon={<MousePointerClick size={15} />}
          label="Clicks"
          value={data.clicks}
          prev={data.prevClicks}
          format={compact}
          vs={vs}
          spark={points.map((p) => p.clicks)}
          color="#c9a7f2"
          delay={60}
        />
        <Kpi
          icon={<Percent size={15} />}
          label="Click-through rate"
          value={data.ctr}
          prev={data.prevCtr}
          format={(n) => pct(n)}
          vs={vs}
          spark={points.map((p) => p.ctr)}
          color="#a7c7f7"
          delay={120}
        />
        <Kpi
          icon={<Layers size={15} />}
          label="Buttons"
          value={data.activeLinks}
          format={(n) => String(Math.round(n))}
          vs={page ? `on ultralink.bio/${page.slug}` : "across all your pages"}
          delay={180}
        />
      </div>

      {points.length > 1 && <ActivityCard key={chartKey} points={points} rangeText={rangeText} />}

      <div className={s.grid2}>
        <section className={s.card} onPointerMove={spotlight} aria-labelledby="an-countries">
          <div className={s.cardHead}>
            <div>
              <h2 id="an-countries" className={s.cardTitle}>
                Top countries
              </h2>
              <p className={s.cardSub}>By views</p>
            </div>
          </div>
          {data.countries.length === 0 ? (
            <p className={s.cardEmpty}>No visitors in this period yet.</p>
          ) : (
            <div key={chartKey}>
              {data.countries.slice(0, 6).map((c, i) => (
                <div key={c.code} className={s.barRow}>
                  <span className={s.flag} aria-hidden="true">
                    {c.code === "Unknown" ? "🌐" : flagEmoji(c.code)}
                  </span>
                  <div className={s.barTop}>
                    <span>{c.code === "Unknown" ? "Unknown" : getCountryName(c.code)}</span>
                    <span>
                      <span className={s.barValue} style={{ color: "#fff", marginRight: 8 }}>
                        {compact(c.count)}
                      </span>
                      {c.pct}%
                    </span>
                  </div>
                  <div className={s.barTrack}>
                    <div
                      className={s.barFill}
                      style={{
                        width: `${(c.count / data.countries[0].count) * 100}%`,
                        animationDelay: `${i * 70}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <SourcesCard key={`src-${chartKey}`} data={data} />
      </div>

      <div className={s.grid2}>
        <section className={s.card} onPointerMove={spotlight} aria-labelledby="an-devices">
          <div className={s.cardHead}>
            <div>
              <h2 id="an-devices" className={s.cardTitle}>
                Devices
              </h2>
              <p className={s.cardSub}>Of visitors</p>
            </div>
          </div>
          <div className={s.stack} key={chartKey} aria-hidden="true">
            {devices.map((d, i) => (
              <span
                key={d.id}
                style={{
                  width: `${(d.count / deviceTotal) * 100}%`,
                  background: d.color,
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
          <div className={s.deviceGrid}>
            {devices.map(({ id, label, count, color, Icon }) => (
              <div key={id} className={s.device}>
                <Icon size={17} aria-hidden="true" style={{ color }} />
                <div className={s.deviceShare}>{pct((count / deviceTotal) * 100, 0)}</div>
                <div className={s.deviceMeta}>
                  {label} · {compact(count)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={s.card} onPointerMove={spotlight} aria-labelledby="an-winback">
          <div className={s.cardHead}>
            <div>
              <h2 id="an-winback" className={s.cardTitle}>
                Win-Back
              </h2>
              <p className={s.cardSub}>Visitors who were about to leave</p>
            </div>
          </div>
          <div className={s.winback}>
            <Ring key={chartKey} value={winbackRate} />
            <div className={s.wbStats}>
              <div className={s.wbStat}>
                Offer shown <strong>{data.winbackShown.toLocaleString("en-US")}</strong>
              </div>
              <div className={s.wbStat}>
                Came back <strong>{data.winbackClicks.toLocaleString("en-US")}</strong>
              </div>
              <div className={s.wbStat}>
                Of all clicks <strong>{data.clicks ? pct((data.winbackClicks / data.clicks) * 100) : "0%"}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className={cx(s.card, s.chartCard)} onPointerMove={spotlight} aria-labelledby="an-links">
        <div className={s.cardHead}>
          <div>
            <h2 id="an-links" className={s.cardTitle}>
              Top links
            </h2>
            <p className={s.cardSub}>
              {page ? `Buttons on ultralink.bio/${page.slug}` : "Most tapped buttons across all pages"}
            </p>
          </div>
        </div>
        {data.topLinks.length === 0 ? (
          <p className={s.cardEmpty}>No clicks in this period yet.</p>
        ) : (
          <>
            <div className={cx(s.tl, s.tlHead)}>
              <span />
              <span>Button</span>
              <span style={{ textAlign: "right" }}>Clicks</span>
              <span>Share</span>
            </div>
            <div key={chartKey}>
              {data.topLinks.map((l, i) => (
                <div key={l.link_id} className={s.tl}>
                  <span className={s.rank}>{i + 1}</span>
                  <span style={{ minWidth: 0 }}>
                    <span className={s.tlLabel} style={{ display: "block" }}>
                      {l.label}
                    </span>
                    <span className={s.tlHost}>{hostOf(l.url)}</span>
                  </span>
                  <span style={{ textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {compact(l.clicks)}
                  </span>
                  <span className={s.barTrack} style={{ gridColumn: "auto" }}>
                    <span
                      className={s.barFill}
                      style={{
                        display: "block",
                        width: `${(l.clicks / data.topLinks[0].clicks) * 100}%`,
                        animationDelay: `${i * 70}ms`,
                      }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ─── KPI tile ────────────────────────────────────────────────────────────────

function Kpi({
  icon,
  label,
  value,
  prev,
  format,
  vs,
  spark,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  prev?: number;
  format: (n: number) => string;
  vs: string;
  spark?: number[];
  color?: string;
  delay: number;
}) {
  const shown = useCountUp(value, true);
  return (
    <div className={cx(s.card, s.kpi, s.enter)} onPointerMove={spotlight} style={{ animationDelay: `${delay}ms` }}>
      <div className={s.statLabel}>
        <span className={s.kpiIcon} aria-hidden="true">
          {icon}
        </span>
        {label}
      </div>
      <div className={s.kpiValue}>{format(shown)}</div>
      <div className={s.kpiFoot}>
        {prev !== undefined && <Delta current={value} previous={prev} />}
        {vs}
      </div>
      {spark && spark.length > 1 && <Sparkline data={spark} color={color} />}
    </div>
  );
}

// ─── Activity chart ──────────────────────────────────────────────────────────

const W = 1000;
const H = 300;

/** Top of the y-axis: four even steps of 1, 2, 2.5 or 5 × a power of ten, so the labels stay round */
function niceMax(m: number) {
  if (m <= 4) return 4;
  const raw = m / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((f) => f * pow).find((v) => v >= raw) ?? 10 * pow;
  return step * 4;
}

/** Catmull-Rom through the points, written as cubic Béziers */
function smooth(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    // Keeping the handles between the two points' heights stops the curve from
    // overshooting: it never rises above a peak or dips below zero
    const lo = Math.min(p1[1], p2[1]);
    const hi = Math.max(p1[1], p2[1]);
    const clampY = (v: number) => Math.min(hi, Math.max(lo, v));
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, clampY(p1[1] + (p2[1] - p0[1]) / 6)];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, clampY(p2[1] - (p3[1] - p1[1]) / 6)];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

function ActivityCard({
  points,
  rangeText,
}: {
  points: { label: string; views: number; clicks: number; ctr: number }[];
  rangeText: string;
}) {
  const id = useId();
  const [show, setShow] = useState({ views: true, clicks: true });
  const [hover, setHover] = useState<number | null>(null);

  const n = points.length;
  // Scale to whichever visible line is highest; clicks can outnumber views on a day
  const max = niceMax(Math.max(...points.map((p) => Math.max(show.views ? p.views : 0, show.clicks ? p.clicks : 0))));
  const x = (i: number) => (i / (n - 1)) * W;
  const y = (v: number) => H - (v / max) * H;
  const viewsPath = smooth(points.map((p, i) => [x(i), y(p.views)]));
  const clicksPath = smooth(points.map((p, i) => [x(i), y(p.clicks)]));
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => points[Math.round(f * (n - 1))].label);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHover(Math.round(f * (n - 1)));
  };

  const hp = hover !== null ? points[hover] : null;
  const hx = hover !== null ? (hover / (n - 1)) * 100 : 0;

  return (
    <section
      className={cx(s.card, s.chartCard, s.noSpot, s.enter)}
      style={{ animationDelay: "120ms" }}
      aria-labelledby={`${id}t`}
    >
      <div className={s.cardHead}>
        <div>
          <h2 id={`${id}t`} className={s.cardTitle}>
            Activity
          </h2>
          <p className={s.cardSub}>{rangeText}</p>
        </div>
        <div className={s.legend}>
          {(
            [
              ["views", "Views", "linear-gradient(90deg,#fbc2a4,#f7a8c4,#c9a7f2)"],
              ["clicks", "Clicks", "#e4e4e7"],
            ] as const
          ).map(([k, label, bg]) => (
            <button
              key={k}
              type="button"
              className={cx(s.legendBtn, !show[k] && s.legendOff)}
              aria-pressed={show[k]}
              onClick={() =>
                setShow((v) => {
                  const next = { ...v, [k]: !v[k] };
                  // Never hide both lines
                  return next.views || next.clicks ? next : v;
                })
              }
            >
              <span className={s.swatch} style={{ background: bg }} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={s.chart}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Views and clicks, ${rangeText.toLowerCase()}`}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <span key={f} className={s.yLabel} style={{ top: `${(1 - f) * 100}%` }}>
            {compact(max * f)}
          </span>
        ))}
        <svg className={s.chartSvg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={`${id}stroke`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fbc2a4" />
              <stop offset="40%" stopColor="#f7a8c4" />
              <stop offset="75%" stopColor="#c9a7f2" />
              <stop offset="100%" stopColor="#a7c7f7" />
            </linearGradient>
            <linearGradient id={`${id}fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f7a8c4" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#c9a7f2" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}fill2`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.07" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1="0"
              x2={W}
              y1={H * f}
              y2={H * f}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray={f === 1 ? undefined : "3 5"}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {show.views && (
            <>
              <path d={`${viewsPath} L${W},${H} L0,${H} Z`} fill={`url(#${id}fill)`} />
              <path
                d={viewsPath}
                fill="none"
                stroke={`url(#${id}stroke)`}
                strokeWidth="2.25"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
          {show.clicks && (
            <>
              <path d={`${clicksPath} L${W},${H} L0,${H} Z`} fill={`url(#${id}fill2)`} />
              <path
                d={clicksPath}
                fill="none"
                stroke="rgba(228,228,231,0.75)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </>
          )}
        </svg>

        {hp && (
          <>
            <span className={s.crosshair} style={{ left: `${hx}%` }} />
            <div
              className={s.tooltip}
              style={{ left: `${hx}%`, transform: hx > 66 ? "translateX(calc(-100% - 14px))" : "translateX(14px)" }}
            >
              <div className={s.ttDate}>{hp.label}</div>
              <div className={s.ttRow}>
                <span className={s.swatch} style={{ background: "#f7a8c4" }} /> Views{" "}
                <strong>{hp.views.toLocaleString("en-US")}</strong>
              </div>
              <div className={s.ttRow}>
                <span className={s.swatch} style={{ background: "#e4e4e7" }} /> Clicks{" "}
                <strong>{hp.clicks.toLocaleString("en-US")}</strong>
              </div>
              <div className={s.ttRow}>
                <span className={s.swatch} style={{ background: "#a7c7f7" }} /> CTR <strong>{pct(hp.ctr)}</strong>
              </div>
            </div>
          </>
        )}
      </div>
      <div className={s.xLabels} aria-hidden="true">
        {xTicks.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </section>
  );
}

// ─── Sources donut ───────────────────────────────────────────────────────────

const SOURCE_COLORS = ["#f7a8c4", "#c9a7f2", "#a7c7f7", "#fbc2a4", "#86efac", "#fde68a", "#52525b"];

function sourceIcon(label: string) {
  if (label === "Direct") return <Link2 size={16} aria-hidden="true" />;
  // Labels like "Instagram" or "Twitter / X" → the matching platform icon
  const name = label.toLowerCase();
  const id = name.includes("twitter") || name === "x" ? "x" : name.split(/[\s/]/)[0];
  return getPlatform(id) ? <BrandIcon id={id} /> : <Globe size={16} aria-hidden="true" />;
}

function SourcesCard({ data }: { data: AnalyticsData }) {
  const [active, setActive] = useState<number | null>(null);
  const r = 62;
  const c = 2 * Math.PI * r;
  const total = data.sources.reduce((sum, x) => sum + x.count, 0) || 1;
  const segments = useMemo(
    () =>
      data.sources.reduce<{ len: number; offset: number }[]>((acc, src) => {
        const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].len + 3 : 0;
        acc.push({ len: Math.max(0, (src.count / total) * c - 3), offset });
        return acc;
      }, []),
    [data.sources, total, c],
  );
  const sel = active !== null ? data.sources[active] : null;

  return (
    <section className={s.card} onPointerMove={spotlight} aria-labelledby="an-sources">
      <div className={s.cardHead}>
        <div>
          <h2 id="an-sources" className={s.cardTitle}>
            Traffic sources
          </h2>
          <p className={s.cardSub}>Where your visitors tapped your link</p>
        </div>
      </div>
      {data.sources.length === 0 ? (
        <p className={s.cardEmpty}>No visitors in this period yet.</p>
      ) : (
        <div className={s.donutWrap}>
          <div className={s.donut}>
            <svg width="156" height="156" viewBox="0 0 156 156" aria-hidden="true">
              <circle cx="78" cy="78" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="16" />
              {segments.map((g, i) => (
                <circle
                  key={i}
                  className={s.donutSeg}
                  cx="78"
                  cy="78"
                  r={r}
                  fill="none"
                  stroke={SOURCE_COLORS[i % SOURCE_COLORS.length]}
                  strokeWidth={active === i ? 20 : 16}
                  strokeDasharray={`${g.len} ${c}`}
                  strokeDashoffset={-g.offset}
                  opacity={active !== null && active !== i ? 0.3 : 1}
                  style={{ animationDelay: `${i * 90}ms` }}
                />
              ))}
            </svg>
            <div className={s.donutCenter} aria-live="polite">
              <span className={s.donutValue}>{sel ? `${sel.pct}%` : compact(data.views)}</span>
              <span className={s.donutLabel}>{sel ? sel.label : "views"}</span>
            </div>
          </div>
          <ul className={s.legendList} style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {data.sources.map((src, i) => (
              <li
                key={`${src.label}-${i}`}
                className={s.legendRow}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                style={{ color: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
              >
                {sourceIcon(src.label)}
                <span style={{ color: "var(--text)" }}>{src.label}</span>
                <span>
                  {compact(src.count)} · {src.pct}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// ─── Win-Back ring ───────────────────────────────────────────────────────────

function Ring({ value }: { value: number }) {
  const id = useId();
  const r = 56;
  const c = 2 * Math.PI * r;
  return (
    <div className={s.ring}>
      <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbc2a4" />
            <stop offset="50%" stopColor="#f7a8c4" />
            <stop offset="100%" stopColor="#c9a7f2" />
          </linearGradient>
        </defs>
        <circle cx="66" cy="66" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        {value > 0 && (
          <circle
            className={s.ringArc}
            cx="66"
            cy="66"
            r={r}
            fill="none"
            stroke={`url(#${id}g)`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - value)}
            style={{ "--len": c } as React.CSSProperties}
          />
        )}
      </svg>
      <div className={s.donutCenter}>
        <span className={s.donutValue}>{pct(value * 100)}</span>
        <span className={s.donutLabel}>came back</span>
      </div>
    </div>
  );
}

// ─── Pickers ─────────────────────────────────────────────────────────────────

function PagePicker({
  pages,
  value,
  onChange,
}: {
  pages: PageOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const { open, setOpen, ref } = usePopover();
  const current = pages.find((p) => p.id === value);
  const options = [{ id: "all", title: "All pages", slug: "" }, ...pages];
  return (
    <div className={s.popWrap} ref={ref}>
      <button
        type="button"
        className={s.picker}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className={cx(s.pickerThumb, s.pickerAll)} aria-hidden="true">
          <Layers size={13} />
        </span>
        {current ? current.title || current.slug : "All pages"}
        <ChevronDown size={14} aria-hidden="true" style={{ color: "var(--subtle)" }} />
      </button>
      {open && (
        <div className={cx(s.menu, s.menuLeft)} role="menu" style={{ minWidth: 250 }}>
          {options.map((p) => (
            <button
              key={p.id}
              type="button"
              role="menuitemradio"
              aria-checked={p.id === value}
              className={s.menuItem}
              onClick={() => {
                onChange(p.id);
                setOpen(false);
              }}
            >
              <span>
                {p.title || p.slug}
                {p.slug && (
                  <span style={{ display: "block", fontSize: 11.5, color: "var(--subtle)" }}>
                    ultralink.bio/{p.slug}
                  </span>
                )}
              </span>
              {p.id === value && <Check size={15} className={s.check} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const QUICK: { value: RangeKey; label: string; aria: string }[] = [
  { value: "7d", label: "7D", aria: "Last 7 days" },
  { value: "30d", label: "30D", aria: "Last 30 days" },
  { value: "90d", label: "90D", aria: "Last 90 days" },
];

function RangePicker({
  value,
  custom,
  onChange,
  onCustom,
}: {
  value: RangeKey;
  custom: { start: string; end: string };
  onChange: (k: RangeKey) => void;
  onCustom: (r: { start: string; end: string }) => void;
}) {
  const { open, setOpen, ref } = usePopover();
  const [start, setStart] = useState(custom.start);
  const [end, setEnd] = useState(custom.end);
  const quick = QUICK.some((q) => q.value === value);
  const today = toStr(new Date());
  const invalid = !start || !end || start > end || end > today;

  return (
    <div className={s.rangeRow}>
      <Segmented label="Date range" value={quick ? value : ("" as RangeKey)} onChange={onChange} options={QUICK} />
      <div className={s.popWrap} ref={ref}>
        <button
          type="button"
          className={cx(s.btnGhost, s.btnSm, !quick && s.rangeOn)}
          style={{ height: 38, fontWeight: 500 }}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <CalendarDays size={14} aria-hidden="true" />
          {quick ? "More" : rangeLabel(value, custom)}
        </button>
        {open && (
          <div className={cx(s.menu, s.rangeMenu)} role="dialog" aria-label="Choose a period">
            {(["thisMonth", "lastMonth"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={s.menuItem}
                onClick={() => {
                  onChange(k);
                  setOpen(false);
                }}
              >
                {rangeLabel(k, custom)}
                {value === k && <Check size={15} className={s.check} aria-hidden="true" />}
              </button>
            ))}
            <div className={s.menuSep} role="separator" />
            <div className={s.menuHead}>Custom range</div>
            <div className={s.dateRow}>
              <label>
                <span className={s.srOnly}>Start date</span>
                <input
                  type="date"
                  className={s.input}
                  value={start}
                  max={end || today}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <span aria-hidden="true">–</span>
              <label>
                <span className={s.srOnly}>End date</span>
                <input
                  type="date"
                  className={s.input}
                  value={end}
                  min={start}
                  max={today}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </div>
            <button
              type="button"
              className={cx(s.btnLight, s.btnSm, s.btnBlock)}
              disabled={invalid}
              onClick={() => {
                onCustom({ start, end });
                onChange("custom");
                setOpen(false);
              }}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
