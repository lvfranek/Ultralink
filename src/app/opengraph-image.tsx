import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config/site";

// Applies to every page that doesn't set its own `openGraph.images` (see
// generateMetadata's "shallow merge" rules) — i.e. home, login, help,
// privacy, terms, imprint. Creator bio pages (/[slug]) set their own
// openGraph.images (the creator's avatar) and are unaffected by this file.
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The site's link-chain mark (public/logo.svg), recolored to white for the
// dark card below. Passed as a data URI — ImageResponse/Satori supports
// <img src> but not arbitrary inline <svg> shapes.
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#ffffff" d="M31,16v6c0,2.757-2.243,5-5,5H16c-2.757,0-5-2.243-5-5h4c0,0.552,0.449,1,1,1h10 c0.551,0,1-0.448,1-1v-6c0-0.552-0.449-1-1-1H16c-0.551,0-1,0.448-1,1h-4c0-2.757,2.243-5,5-5h10C28.757,11,31,13.243,31,16z M21,16 h-4c0,0.552-0.449,1-1,1H6c-0.551,0-1-0.448-1-1v-6c0-0.552,0.449-1,1-1h10c0.551,0,1,0.448,1,1h4c0-2.757-2.243-5-5-5H6 c-2.757,0-5,2.243-5,5v6c0,2.757,2.243,5,5,5h10C18.757,21,21,18.757,21,16z"/></svg>`;
const ICON_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(ICON_SVG).toString("base64")}`;

export default function Image() {
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
        <img src={ICON_DATA_URI} width={72} height={72} alt="" />
        <span style={{ color: "#ffffff", fontSize: 96, fontWeight: 600, letterSpacing: "-0.03em" }}>ultralink</span>
      </div>
      <div style={{ display: "flex", color: "#9A9A9A", fontSize: 34, marginTop: 28 }}>{siteConfig.tagline}</div>
    </div>,
    { ...size },
  );
}
