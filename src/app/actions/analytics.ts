"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getReferrerLabel } from "@/lib/config/referrers";

export interface TimeseriesPoint {
  date: string;
  views: number;
  clicks: number;
}

export interface CountryRow {
  code: string;
  count: number;
  pct: number;
}

export interface SourceRow {
  host: string | null;
  label: string;
  count: number;
  pct: number;
}

export interface DeviceCounts {
  mobile: number;
  desktop: number;
  tablet: number;
  total: number;
}

export interface LinkRow {
  link_id: string;
  label: string;
  url: string;
  clicks: number;
  pct: number;
}

export interface AnalyticsData {
  views: number;
  clicks: number;
  ctr: number;
  activeLinks: number;
  prevViews: number;
  prevClicks: number;
  prevCtr: number;
  timeseries: TimeseriesPoint[];
  countries: CountryRow[];
  sources: SourceRow[];
  devices: DeviceCounts;
  topLinks: LinkRow[];
  winbackShown: number;
  winbackClicks: number;
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

export async function getAnalyticsData(
  pageId: string,
  startStr: string,
  endStr: string,
): Promise<AnalyticsData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify ownership
  const { data: pageCheck } = await supabase
    .from("pages")
    .select("owner_id")
    .eq("id", pageId)
    .single();
  if (!pageCheck || pageCheck.owner_id !== user.id) return null;

  const startDate = startOfDay(new Date(startStr));
  const endDate = endOfDay(new Date(endStr));

  // Previous period mirrors the current range exactly
  const rangeMs = endDate.getTime() - startDate.getTime();
  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - rangeMs);

  const [eventsRes, prevEventsRes, linksRes] = await Promise.all([
    supabase
      .from("events")
      .select("kind, country, device, referrer_host, link_id, created_at")
      .eq("page_id", pageId)
      .neq("device", "bot")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString()),
    supabase
      .from("events")
      .select("kind")
      .eq("page_id", pageId)
      .neq("device", "bot")
      .gte("created_at", prevStartDate.toISOString())
      .lte("created_at", prevEndDate.toISOString()),
    supabase
      .from("page_links")
      .select("id, label, url")
      .eq("page_id", pageId),
  ]);

  const events = eventsRes.data ?? [];
  const prevEvents = prevEventsRes.data ?? [];
  const links = linksRes.data ?? [];

  // ── Headline numbers ────────────────────────────────────────────────────────
  const views = events.filter((e) => e.kind === "view").length;
  const clicks = events.filter((e) => e.kind === "click").length;
  const ctr = views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0;

  const prevViews = prevEvents.filter((e) => e.kind === "view").length;
  const prevClicks = prevEvents.filter((e) => e.kind === "click").length;
  const prevCtr =
    prevViews > 0 ? Math.round((prevClicks / prevViews) * 1000) / 10 : 0;

  const winbackShown = events.filter((e) => e.kind === "winback_shown").length;
  const winbackClicks = events.filter((e) => e.kind === "winback_click").length;

  // ── Timeseries ──────────────────────────────────────────────────────────────
  const days =
    Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
  const timeseries: TimeseriesPoint[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return { date: d.toISOString().slice(0, 10), views: 0, clicks: 0 };
  });

  for (const e of events) {
    const dateStr = e.created_at.slice(0, 10);
    const bucket = timeseries.find((b) => b.date === dateStr);
    if (bucket) {
      if (e.kind === "view") bucket.views++;
      else bucket.clicks++;
    }
  }

  // ── Countries ───────────────────────────────────────────────────────────────
  const countryCounts: Record<string, number> = {};
  for (const e of events.filter((e) => e.kind === "view")) {
    const code = e.country ?? "Unknown";
    countryCounts[code] = (countryCounts[code] ?? 0) + 1;
  }
  const countries: CountryRow[] = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([code, count]) => ({
      code,
      count,
      pct: views > 0 ? Math.round((count / views) * 100) : 0,
    }));

  // ── Traffic sources ─────────────────────────────────────────────────────────
  const sourceCounts: Record<string, number> = {};
  for (const e of events.filter((e) => e.kind === "view")) {
    const key = e.referrer_host ?? "__direct__";
    sourceCounts[key] = (sourceCounts[key] ?? 0) + 1;
  }
  const sourceEntries = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
  const top6 = sourceEntries.slice(0, 6);
  const otherCount = sourceEntries
    .slice(6)
    .reduce((acc, [, c]) => acc + c, 0);

  const sources: SourceRow[] = [
    ...top6.map(([host, count]) => ({
      host: host === "__direct__" ? null : host,
      label:
        host === "__direct__" ? "Direct" : getReferrerLabel(host),
      count,
      pct: views > 0 ? Math.round((count / views) * 100) : 0,
    })),
    ...(otherCount > 0
      ? [
          {
            host: null,
            label: "Other",
            count: otherCount,
            pct: views > 0 ? Math.round((otherCount / views) * 100) : 0,
          },
        ]
      : []),
  ];

  // ── Devices ─────────────────────────────────────────────────────────────────
  const devices: DeviceCounts = { mobile: 0, desktop: 0, tablet: 0, total: 0 };
  for (const e of events) {
    if (e.device === "mobile") devices.mobile++;
    else if (e.device === "desktop") devices.desktop++;
    else if (e.device === "tablet") devices.tablet++;
  }
  devices.total = devices.mobile + devices.desktop + devices.tablet;

  // ── Top links ───────────────────────────────────────────────────────────────
  const linkClickCounts: Record<string, number> = {};
  for (const e of events.filter((e) => e.kind === "click" && e.link_id)) {
    const id = e.link_id!;
    linkClickCounts[id] = (linkClickCounts[id] ?? 0) + 1;
  }
  const topLinks: LinkRow[] = Object.entries(linkClickCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([linkId, count]) => {
      const link = links.find((l) => l.id === linkId);
      return {
        link_id: linkId,
        label: link?.label ?? "Unknown",
        url: link?.url ?? "",
        clicks: count,
        pct: clicks > 0 ? Math.round((count / clicks) * 100) : 0,
      };
    });

  return {
    views,
    clicks,
    ctr,
    activeLinks: links.length,
    prevViews,
    prevClicks,
    prevCtr,
    timeseries,
    countries,
    sources,
    devices,
    topLinks,
    winbackShown,
    winbackClicks,
  };
}

export async function getUserPages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("pages")
    .select("id, slug, title")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });

  return data ?? [];
}
