import type { MetadataRoute } from "next";

// Served as /robots.txt. Public pages (homepage, bio pages, help, legal) stay
// crawlable; logged-in areas and technical endpoints are skipped.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/api/", "/auth/", "/checkout", "/invite/", "/reset-password"],
    },
  };
}
