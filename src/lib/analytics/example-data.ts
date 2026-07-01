import type { AnalyticsData } from "@/app/actions/analytics";

/**
 * Static, plausible-looking analytics used for Free users on /dashboard/analytics.
 * Numbers are hand-tuned to look real (not round) and to make the headline
 * deltas (+18%, +22%, +3%) come out correctly through the dashboard's own
 * delta formula.
 */
export const EXAMPLE_ANALYTICS_DATA: AnalyticsData = {
  views: 1247,
  clicks: 312,
  ctr: 25.0,
  activeLinks: 4,
  prevViews: 1057,
  prevClicks: 256,
  prevCtr: 24.3,

  timeseries: [
    { date: "2026-06-25", views: 142, clicks: 32 },
    { date: "2026-06-26", views: 165, clicks: 38 },
    { date: "2026-06-27", views: 201, clicks: 55 },
    { date: "2026-06-28", views: 178, clicks: 40 },
    { date: "2026-06-29", views: 190, clicks: 45 },
    { date: "2026-06-30", views: 205, clicks: 58 },
    { date: "2026-07-01", views: 166, clicks: 44 },
  ],

  countries: [
    { code: "US", count: 424, pct: 34 },
    { code: "DE", count: 224, pct: 18 },
    { code: "GB", count: 150, pct: 12 },
    { code: "FR", count: 100, pct: 8 },
    { code: "CA", count: 87, pct: 7 },
    { code: "AU", count: 62, pct: 5 },
    { code: "NL", count: 50, pct: 4 },
    { code: "BR", count: 50, pct: 4 },
    { code: "SE", count: 37, pct: 3 },
    { code: "JP", count: 63, pct: 5 },
  ],

  sources: [
    { host: "instagram.com", label: "Instagram", count: 524, pct: 42 },
    { host: null, label: "Direct", count: 349, pct: 28 },
    { host: "tiktok.com", label: "TikTok", count: 187, pct: 15 },
    { host: "twitter.com", label: "Twitter / X", count: 112, pct: 9 },
    { host: "linktr.ee", label: "Linktree", count: 50, pct: 4 },
    { host: null, label: "Other", count: 25, pct: 2 },
  ],

  devices: { mobile: 973, desktop: 224, tablet: 50, total: 1247 },

  topLinks: [
    { link_id: "example-1", label: "New drop 🔥", url: "https://instagram.com", clicks: 142, pct: 46 },
    { link_id: "example-2", label: "Latest video", url: "https://youtube.com", clicks: 89, pct: 29 },
    { link_id: "example-3", label: "My OF", url: "https://onlyfans.com", clicks: 54, pct: 17 },
    { link_id: "example-4", label: "Merch shop", url: "https://shop.example.com", clicks: 27, pct: 8 },
  ],

  winbackShown: 87,
  winbackClicks: 19,
};
