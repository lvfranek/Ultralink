import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config/site";

// Applies to every page that doesn't set its own `openGraph.images` (see
// generateMetadata's "shallow merge" rules) — i.e. home, login, help,
// privacy, terms, imprint. Creator bio pages (/[slug]) set their own
// openGraph.images (the creator's avatar) and are unaffected by this file.
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The logo mark (public/favicon/ultralink-icon.svg): black chain on the aurora
// tile. Passed as a data URI — ImageResponse/Satori supports <img src> but not
// arbitrary inline <svg> shapes.
const ICON_SVG = readFileSync(join(process.cwd(), "public/favicon/ultralink-icon.svg"), "utf8");
const ICON_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(ICON_SVG).toString("base64")}`;

// Satori doesn't ship Geist (the wordmark is Geist Bold, the tagline Geist
// Regular). Fetched from Google Fonts, subset to the glyphs each line uses; if
// that fails, fall back to the default font rather than failing the build.
async function loadGeist(weight: 400 | 700, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Geist:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const [geistBold, geistRegular] = await Promise.all([
    loadGeist(700, "ultralink"),
    loadGeist(400, siteConfig.tagline),
  ]);
  const fonts = [
    ...(geistBold ? [{ name: "Geist", data: geistBold, style: "normal" as const, weight: 700 as const }] : []),
    ...(geistRegular ? [{ name: "Geist", data: geistRegular, style: "normal" as const, weight: 400 as const }] : []),
  ];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A0A0A",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {/* next/og's ImageResponse renders via Satori, not the browser DOM — next/image doesn't apply */}
        <img src={ICON_DATA_URI} width={84} height={84} alt="" />
        <span
          style={{ color: "#ffffff", fontSize: 104, fontFamily: "Geist", fontWeight: 700, letterSpacing: "-0.05em" }}
        >
          ultralink
        </span>
      </div>
      <div style={{ display: "flex", color: "#9A9A9A", fontSize: 34, fontWeight: 400, marginTop: 28 }}>
        {siteConfig.tagline}
      </div>
    </div>,
    {
      ...size,
      fonts: fonts.length ? fonts : undefined,
    },
  );
}
