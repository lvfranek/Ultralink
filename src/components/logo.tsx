import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  iconSize?: number;
  showWordmark?: boolean;
  href?: string;
  onDark?: boolean;
}

export function Logo({ className = "", iconSize = 28, showWordmark = true, href = "/", onDark = false }: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`} aria-label="Ultralink">
      <Image
        src="/logo.svg"
        alt=""
        width={iconSize}
        height={iconSize}
        aria-hidden="true"
        style={{ width: iconSize, height: iconSize, filter: onDark ? "invert(1)" : undefined }}
      />
      {showWordmark && (
        <span
          className="text-[1.05rem] font-semibold tracking-[-0.02em]"
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
