import Link from "next/link";

interface LogoProps {
  className?: string;
  iconSize?: number;
  showWordmark?: boolean;
  href?: string;
}

export function Logo({
  className = "",
  iconSize = 28,
  showWordmark = true,
  href = "/",
}: LogoProps) {
  const content = (
    <span
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      aria-label="Ultralink"
    >
      {/* SVG mark: two interlocked chain links forming a subtle upward arrow */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        {/* Left link ring */}
        <path
          d="M10.5 17.5C8.01 17.5 6 15.49 6 13C6 10.51 8.01 8.5 10.5 8.5H13.5C14.05 8.5 14.5 8.05 14.5 7.5C14.5 6.95 14.05 6.5 13.5 6.5H10.5C6.91 6.5 4 9.41 4 13C4 16.59 6.91 19.5 10.5 19.5H13.5C14.05 19.5 14.5 19.05 14.5 18.5C14.5 17.95 14.05 17.5 13.5 17.5H10.5Z"
          fill="url(#gold-grad)"
        />
        {/* Right link ring */}
        <path
          d="M17.5 6.5H14.5C13.95 6.5 13.5 6.95 13.5 7.5C13.5 8.05 13.95 8.5 14.5 8.5H17.5C19.99 8.5 22 10.51 22 13C22 15.49 19.99 17.5 17.5 17.5H14.5C13.95 17.5 13.5 17.95 13.5 18.5C13.5 19.05 13.95 19.5 14.5 19.5H17.5C21.09 19.5 24 16.59 24 13C24 9.41 21.09 6.5 17.5 6.5Z"
          fill="url(#gold-grad)"
        />
        {/* Upward connecting bar */}
        <rect x="9.5" y="12" width="9" height="2" rx="1" fill="url(#gold-grad)" />
        {/* Upward arrow tip */}
        <path
          d="M14 4L11 8H17L14 4Z"
          fill="url(#gold-grad)"
          opacity="0.7"
        />
        <defs>
          <linearGradient id="gold-grad" x1="4" y1="4" x2="24" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E6C878" />
            <stop offset="100%" stopColor="#C9A86A" />
          </linearGradient>
        </defs>
      </svg>

      {showWordmark && (
        <span
          className="text-[1.05rem] font-semibold tracking-[-0.02em] text-text"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          ultra<span className="text-gold">link</span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm">
        {content}
      </Link>
    );
  }

  return content;
}
