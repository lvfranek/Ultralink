import Image from "next/image";
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
      <Image
        src="/logo.svg"
        alt=""
        width={iconSize}
        height={iconSize}
        aria-hidden="true"
        style={{ width: iconSize, height: iconSize }}
      />
      {showWordmark && (
        <span
          className="text-[1.05rem] font-semibold tracking-[-0.02em] text-text"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          ultralink
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-text rounded-sm">
        {content}
      </Link>
    );
  }

  return content;
}
