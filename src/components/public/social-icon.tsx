import { getPlatform } from "@/lib/config/socials";

interface SocialIconProps {
  platform: string;
  size?: number;
  className?: string;
}

export function SocialIcon({ platform, size = 20, className = "" }: SocialIconProps) {
  const def = getPlatform(platform);
  if (!def) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-label={def.label}
      className={className}
    >
      <path d={def.svgPath} />
    </svg>
  );
}
