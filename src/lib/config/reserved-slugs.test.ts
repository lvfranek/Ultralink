import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isReservedSlug } from "./reserved-slugs";

const APP_DIR = path.join(process.cwd(), "src/app");
const PUBLIC_DIR = path.join(process.cwd(), "public");

/** True when the folder (or anything below it) serves a URL */
function hasRoute(dir: string): boolean {
  return readdirSync(dir).some((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return hasRoute(full);
    return /^(page|route)\.(tsx?|jsx?)$/.test(name);
  });
}

/** First URL segment of every route, looking through (group) folders */
function topLevelRoutes(dir = APP_DIR): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (!statSync(full).isDirectory()) {
      // Metadata files like opengraph-image.tsx are served at /opengraph-image
      const meta = name.match(/^(opengraph-image|twitter-image|icon|apple-icon)\.(tsx?|jsx?)$/);
      return meta ? [meta[1]] : [];
    }
    if (/^\(.+\)$/.test(name)) return topLevelRoutes(full);
    // Dynamic ([slug]) and private (_lab) folders aren't fixed URLs
    if (name.startsWith("[") || name.startsWith("_")) return [];
    return hasRoute(full) ? [name] : [];
  });
}

describe("reserved slugs", () => {
  it("covers every top-level app route, so no user page can be shadowed", () => {
    const routes = topLevelRoutes();
    expect(routes.length).toBeGreaterThan(5);
    expect(routes.filter((r) => !isReservedSlug(r))).toEqual([]);
  });

  it("covers every folder in public/", () => {
    const folders = existsSync(PUBLIC_DIR)
      ? readdirSync(PUBLIC_DIR).filter((n) => statSync(path.join(PUBLIC_DIR, n)).isDirectory())
      : [];
    expect(folders.filter((f) => !isReservedSlug(f))).toEqual([]);
  });

  it("ignores case", () => {
    expect(isReservedSlug("Dashboard")).toBe(true);
    expect(isReservedSlug("mialaurent")).toBe(false);
  });
});
