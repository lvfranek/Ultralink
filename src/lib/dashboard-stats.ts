import type { SupabaseClient } from "@supabase/supabase-js";

export interface WeekStats {
  views: number;
  clicks: number;
  prevViews: number;
  prevClicks: number;
  /** Win-Back offer clicks: visitors who were about to leave and came back */
  recovered: number;
  prevRecovered: number;
  /** Oldest day first, 7 entries */
  viewsDaily: number[];
  clicksDaily: number[];
  perPage: Record<string, { views: number; clicks: number }>;
}

const DAY = 86_400_000;

/**
 * Last 7 days vs the 7 before, across the given pages. Uses count queries
 * rather than fetching rows, so busy pages aren't cut off at the API's row limit.
 */
export async function getWeekStats(supabase: SupabaseClient, pageIds: string[]): Promise<WeekStats> {
  const empty: WeekStats = {
    views: 0,
    clicks: 0,
    prevViews: 0,
    prevClicks: 0,
    recovered: 0,
    prevRecovered: 0,
    viewsDaily: Array(7).fill(0),
    clicksDaily: Array(7).fill(0),
    perPage: {},
  };
  if (pageIds.length === 0) return empty;

  // Same day boundaries as Analytics' "Last 7 days" (server-local midnight), so both show the same numbers
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayStart = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d;
  };
  // Day i covers [start of day i, start of day i + 1); the last day is today
  const start = dayStart(-6);
  const prevStart = dayStart(-13);
  const end = dayStart(1);

  const count = async (kind: string, ids: string[], from: Date, to: Date) => {
    const { count: n } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .in("page_id", ids)
      .eq("kind", kind)
      .neq("device", "bot")
      .gte("created_at", from.toISOString())
      .lt("created_at", to.toISOString());
    return n ?? 0;
  };

  const days = Array.from({ length: 7 }, (_, i) => [dayStart(i - 6), dayStart(i - 5)]);

  const [totals, viewsDaily, clicksDaily, perPage] = await Promise.all([
    Promise.all([
      count("view", pageIds, start, end),
      count("click", pageIds, start, end),
      count("view", pageIds, prevStart, start),
      count("click", pageIds, prevStart, start),
      count("winback_click", pageIds, start, end),
      count("winback_click", pageIds, prevStart, start),
    ]),
    Promise.all(days.map(([from, to]) => count("view", pageIds, from, to))),
    Promise.all(days.map(([from, to]) => count("click", pageIds, from, to))),
    Promise.all(
      pageIds.map(async (id) => {
        const [views, clicks] = await Promise.all([count("view", [id], start, end), count("click", [id], start, end)]);
        return [id, { views, clicks }] as const;
      }),
    ),
  ]);

  const [views, clicks, prevViews, prevClicks, recovered, prevRecovered] = totals;
  return {
    views,
    clicks,
    prevViews,
    prevClicks,
    recovered,
    prevRecovered,
    viewsDaily,
    clicksDaily,
    perPage: Object.fromEntries(perPage),
  };
}

/** Clicks per link over the last `days` days. Count queries, so busy links aren't cut off at the row limit. */
export async function getLinkClicks(
  supabase: SupabaseClient,
  linkIds: string[],
  days = 30,
): Promise<Record<string, number>> {
  const since = new Date(Date.now() - days * DAY).toISOString();
  const counts = await Promise.all(
    linkIds.map(async (id) => {
      const { count } = await supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("link_id", id)
        .eq("kind", "click")
        .neq("device", "bot")
        .gte("created_at", since);
      return [id, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(counts);
}

/** "Just now", "5 min ago", "3 hours ago", "Yesterday", then "Sep 21" */
export function editedAgo(iso: string, now = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  if (hours < 48) return "Yesterday";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
