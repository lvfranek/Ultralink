"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOwnerId } from "@/lib/team";
import { getReferrerLabel } from "@/lib/config/referrers";

interface TimeseriesPoint {
  date: string;
  views: number;
  clicks: number;
}

interface CountryRow {
  code: string;
  count: number;
  pct: number;
}

interface SourceRow {
  host: string | null;
  label: string;
  count: number;
  pct: number;
}

interface DeviceCounts {
  mobile: number;
  desktop: number;
  tablet: number;
  total: number;
}

interface LinkRow {
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

type EventRow = {
  kind: string;
  country: string | null;
  device: string | null;
  referrer_host: string | null;
  link_id: string | null;
  created_at: string;
};

const BATCH = 1000;

/**
 * Every event in the window. The API returns at most 1,000 rows per request, so
 * busy pages are read in batches; a single query silently undercounted them.
 */
async function fetchEvents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  pageIds: string[],
  start: Date,
  end: Date,
): Promise<EventRow[]> {
  const rows: EventRow[] = [];
  for (let from = 0; ; from += BATCH) {
    const { data, error } = await supabase
      .from("events")
      .select("kind, country, device, referrer_host, link_id, created_at")
      .in("page_id", pageIds)
      .neq("device", "bot")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, from + BATCH - 1);
    if (error || !data) break;
    rows.push(...(data as EventRow[]));
    if (data.length < BATCH) break;
  }
  return rows;
}

/** pageId "all" sums up every page of the account */
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

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);

  // Only the active owner's pages
  const { data: owned } = await supabase.from("pages").select("id").eq("owner_id", activeOwnerId);
  const ownedIds = (owned ?? []).map((p: { id: string }) => p.id);
  const pageIds = pageId === "all" ? ownedIds : ownedIds.filter((id) => id === pageId);
  if (pageIds.length === 0) return null;

  const startDate = startOfDay(new Date(startStr));
  const endDate = endOfDay(new Date(endStr));

  const rangeMs = endDate.getTime() - startDate.getTime();
  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - rangeMs);

  // The previous period only needs totals, so it's counted rather than fetched
  const countPrev = async (kind: string) => {
    const { count } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .in("page_id", pageIds)
      .eq("kind", kind)
      .neq("device", "bot")
      .gte("created_at", prevStartDate.toISOString())
      .lte("created_at", prevEndDate.toISOString());
    return count ?? 0;
  };

  const [events, prevViews, prevClicks, linksRes] = await Promise.all([
    fetchEvents(supabase, pageIds, startDate, endDate),
    countPrev("view"),
    countPrev("click"),
    supabase.from("page_links").select("id, label, url, item_type").in("page_id", pageIds),
  ]);

  const links = (linksRes.data ?? []).filter((l) => (l.item_type ?? "button") === "button");

  const views = events.filter((e) => e.kind === "view").length;
  const clicks = events.filter((e) => e.kind === "click").length;
  const ctr = views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0;

  const prevCtr = prevViews > 0 ? Math.round((prevClicks / prevViews) * 1000) / 10 : 0;

  const winbackShown = events.filter((e) => e.kind === "winback_shown").length;
  const winbackClicks = events.filter((e) => e.kind === "winback_click").length;

  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
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

  const sourceCounts: Record<string, number> = {};
  for (const e of events.filter((e) => e.kind === "view")) {
    const key = e.referrer_host ?? "__direct__";
    sourceCounts[key] = (sourceCounts[key] ?? 0) + 1;
  }
  const sourceEntries = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
  const top6 = sourceEntries.slice(0, 6);
  const otherCount = sourceEntries.slice(6).reduce((acc, [, c]) => acc + c, 0);

  const sources: SourceRow[] = [
    ...top6.map(([host, count]) => ({
      host: host === "__direct__" ? null : host,
      label: host === "__direct__" ? "Direct" : getReferrerLabel(host),
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

  const devices: DeviceCounts = { mobile: 0, desktop: 0, tablet: 0, total: 0 };
  for (const e of events) {
    // Visitors, so only page views count; clicks would count the same person again
    if (e.kind !== "view") continue;
    if (e.device === "mobile") devices.mobile++;
    else if (e.device === "desktop") devices.desktop++;
    else if (e.device === "tablet") devices.tablet++;
  }
  devices.total = devices.mobile + devices.desktop + devices.tablet;

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

  const activeOwnerId = await getActiveOwnerId(user.id, supabase);

  const { data } = await supabase
    .from("pages")
    .select("id, slug, title")
    .eq("owner_id", activeOwnerId)
    .order("created_at", { ascending: true });

  return data ?? [];
}
