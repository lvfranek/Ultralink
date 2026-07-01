export type HelpSection = {
  id: string; // url anchor
  title: string;
  description: string; // one line under the section title
  videos: HelpVideo[];
};

export type HelpVideo = {
  id: string; // internal id
  title: string;
  youtubeId: string; // just the video id, e.g. 'dQw4w9WgXcQ'
  duration?: string; // '2:34' — optional cosmetic label
  description?: string; // one-paragraph blurb under the video
};

// The welcome modal shares this video with the "Getting started" section below —
// update it in one place and it changes in both surfaces.
export const WELCOME_VIDEO_ID = "PLACEHOLDER";

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Create your first Ultralink page in 3 minutes.",
    videos: [
      { id: "welcome", title: "Welcome to Ultralink", youtubeId: WELCOME_VIDEO_ID, duration: "2:14" },
      { id: "first-page", title: "Create your first page", youtubeId: "PLACEHOLDER", duration: "3:41" },
    ],
  },
  {
    id: "design",
    title: "Designing your page",
    description: "Themes, colors, fonts, and per-link styling.",
    videos: [
      { id: "themes", title: "Pick a theme", youtubeId: "PLACEHOLDER", duration: "1:52" },
      { id: "colors", title: "Custom colors", youtubeId: "PLACEHOLDER", duration: "2:08" },
      { id: "per-link", title: "Per-link styling", youtubeId: "PLACEHOLDER", duration: "3:12" },
    ],
  },
  {
    id: "features",
    title: "Pro features",
    description: "Analytics, geo-blocking, Win-Back, team access.",
    videos: [
      { id: "analytics", title: "Understanding your analytics", youtubeId: "PLACEHOLDER", duration: "4:23" },
      { id: "winback", title: "Setting up Win-Back", youtubeId: "PLACEHOLDER", duration: "2:47" },
      { id: "geo", title: "Country blocking", youtubeId: "PLACEHOLDER", duration: "1:36" },
      { id: "teams", title: "Inviting your team", youtubeId: "PLACEHOLDER", duration: "2:15" },
    ],
  },
  {
    id: "billing",
    title: "Billing & account",
    description: "Plans, upgrades, and managing your subscription.",
    videos: [
      { id: "plans", title: "Choosing your plan", youtubeId: "PLACEHOLDER", duration: "2:02" },
      { id: "switching", title: "Switching tiers", youtubeId: "PLACEHOLDER", duration: "1:48" },
    ],
  },
];
