import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

// Served as /sitemap.xml. Only the static marketing/legal pages — /login is
// intentionally excluded (it's noindex, see its own metadata), and creator
// bio pages (/[slug]) aren't listed here since there's no fixed list of them.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/help", changeFrequency: "monthly", priority: 0.6 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/imprint", changeFrequency: "yearly", priority: 0.3 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
