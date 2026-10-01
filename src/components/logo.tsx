import { useId } from "react";
import Link from "next/link";

// The original chain mark (also in public/logo.svg), drawn in a 32×32 box
const CHAIN_PATH =
  "M31,16v6c0,2.757-2.243,5-5,5H16c-2.757,0-5-2.243-5-5h4c0,0.552,0.449,1,1,1h10c0.551,0,1-0.448,1-1v-6c0-0.552-0.449-1-1-1H16c-0.551,0-1,0.448-1,1h-4c0-2.757,2.243-5,5-5h10C28.757,11,31,13.243,31,16z M21,16h-4c0,0.552-0.449,1-1,1H6c-0.551,0-1-0.448-1-1v-6c0-0.552,0.449-1,1-1h10c0.551,0,1,0.448,1,1h4c0-2.757-2.243-5-5-5H6c-2.757,0-5,2.243-5,5v6c0,2.757,2.243,5,5,5h10C18.757,21,21,18.757,21,16z";

const RAINBOW_STOPS = [
  ["0%", "#FBC2A4"],
  ["35%", "#F7A8C4"],
  ["70%", "#C9A7F2"],
  ["100%", "#A7C7F7"],
] as const;

/** The app-icon mark: the black chain on a rounded aurora-gradient tile. */
export function LogoMark({ size = 28 }: { size?: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          {RAINBOW_STOPS.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        <radialGradient id={`${id}h`} cx="0.25" cy="0.15" r="0.9">
          <stop offset="0%" stopColor="#fff" stopOpacity=".55" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id}g)`} />
      <rect width="32" height="32" rx="9" fill={`url(#${id}h)`} />
      <path d={CHAIN_PATH} fill="#0A0A0B" transform="translate(16 16) scale(0.62) translate(-16 -16)" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  iconSize?: number;
  showWordmark?: boolean;
  href?: string;
  onDark?: boolean;
}

// Tile and wordmark are sized about 1:1, so the wordmark leads and the tile stays an accent
export function Logo({ className = "", iconSize = 20, showWordmark = true, href = "/", onDark = false }: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2 select-none ${className}`} aria-label="Ultralink">
      <LogoMark size={iconSize} />
      {showWordmark && (
        <span
          className="text-[1.2rem] font-bold leading-none tracking-[-0.05em] whitespace-nowrap"
          style={{ color: onDark ? "#ffffff" : "var(--text)" }}
        >
          ultralink
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-text rounded-sm inline-flex items-center"
      >
        {content}
      </Link>
    );
  }

  return content;
}
