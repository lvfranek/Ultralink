import type { Page, PageLink, PageSocial } from "@/lib/supabase/types";
import { SocialIcon } from "./social-icon";

interface ProfilePageViewProps {
  page: Pick<Page, "slug" | "title" | "bio" | "avatar_url" | "avatar_style" | "active_badge">;
  links: PageLink[];
  socials: PageSocial[];
  isPreview?: boolean;
}

export function ProfilePageView({ page, links, socials, isPreview }: ProfilePageViewProps) {
  const initial = (page.title || page.slug).charAt(0).toUpperCase();
  const isHero = page.avatar_style === "hero";

  return (
    <div className={`min-h-full bg-bg flex flex-col items-center ${isPreview ? "pb-6" : "min-h-dvh px-4 py-12 sm:py-16"}`}>
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Hero avatar */}
        {isHero && page.avatar_url && (
          <div className="relative w-full mb-6 overflow-hidden" style={{ height: 200 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.avatar_url}
              alt={page.title || page.slug}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, transparent 40%, var(--bg) 100%)" }}
            />
          </div>
        )}

        {/* Circle avatar */}
        {!isHero && (
          <div className={isPreview ? "mt-6 mb-5" : "mb-5"}>
            {page.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={page.avatar_url}
                alt={page.title || page.slug}
                className="w-24 h-24 rounded-full object-cover border-2 border-gold/30 shadow-[0_0_20px_rgba(201,168,106,0.15)]"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-bg shadow-[0_0_20px_rgba(201,168,106,0.15)]"
                style={{ background: "linear-gradient(135deg, #E6C878 0%, #C9A86A 100%)" }}
                aria-hidden="true"
              >
                {initial}
              </div>
            )}
          </div>
        )}

        {/* Hero: placeholder if no avatar yet */}
        {isHero && !page.avatar_url && (
          <div className="w-full h-32 bg-gradient-to-b from-surface to-bg mb-6 flex items-center justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-bg"
              style={{ background: "linear-gradient(135deg, #E6C878 0%, #C9A86A 100%)" }}
              aria-hidden="true"
            >
              {initial}
            </div>
          </div>
        )}

        {/* Active badge */}
        {page.active_badge && (
          <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Active now</span>
          </div>
        )}

        {/* Name */}
        {page.title && (
          <h1 className={`font-bold text-text text-center ${isPreview ? "text-lg mb-1" : "text-xl mb-2"}`}>
            {page.title}
          </h1>
        )}

        {/* Slug handle */}
        <p className={`text-text-subtle text-center ${isPreview ? "text-xs mb-3" : "text-sm mb-3"}`}>
          @{page.slug}
        </p>

        {/* Bio */}
        {page.bio && (
          <p className={`text-text-muted text-center leading-relaxed max-w-xs ${isPreview ? "text-xs mb-5" : "text-sm mb-8"}`}>
            {page.bio}
          </p>
        )}

        {/* Socials icon row */}
        {socials.length > 0 && (
          <div className={`flex flex-wrap items-center justify-center gap-3 ${isPreview ? "mb-5" : "mb-8"}`}>
            {socials.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-text transition-colors"
                aria-label={social.platform}
              >
                <SocialIcon platform={social.platform} size={isPreview ? 16 : 20} />
              </a>
            ))}
          </div>
        )}

        {/* Link buttons */}
        {links.length > 0 ? (
          <nav
            className={`w-full ${isPreview ? "space-y-2" : "space-y-3 mt-2"}`}
            aria-label={`${page.title || page.slug}'s links`}
          >
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative flex items-center gap-3 w-full px-5 rounded-[var(--radius)] border border-border-strong bg-surface text-text font-medium hover:border-gold/40 hover:bg-surface-2 hover:text-gold transition-all duration-150 active:scale-[0.99] shadow-sm ${isPreview ? "text-xs py-3" : "text-sm py-4"}`}
              >
                {/* Link icon */}
                {link.icon && !link.icon.startsWith("http") && (
                  <span className="flex-shrink-0 text-text-muted" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={isPreview ? "w-3 h-3" : "w-4 h-4"}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                  </span>
                )}
                {link.icon && link.icon.startsWith("http") && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={link.icon} alt="" className={`flex-shrink-0 object-contain rounded-sm ${isPreview ? "w-4 h-4" : "w-5 h-5"}`} />
                )}

                {/* Thumbnail */}
                {link.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={link.thumbnail_url}
                    alt=""
                    className={`flex-shrink-0 rounded-sm object-cover ${isPreview ? "w-8 h-8" : "w-10 h-10"}`}
                  />
                )}

                <span className="flex-1 text-center">{link.label || link.url}</span>

                {/* 18+ badge */}
                {link.is_adult && (
                  <span className="flex-shrink-0 text-[10px] font-bold text-text-subtle border border-border-strong rounded px-1 py-0.5">
                    18+
                  </span>
                )}
              </a>
            ))}
          </nav>
        ) : (
          !isPreview && (
            <p className="text-sm text-text-subtle text-center mt-4">No links yet.</p>
          )
        )}

        {/* Attribution */}
        {!isPreview && (
          <div className="mt-12 flex items-center gap-1.5">
            <a
              href="https://ultralink.bio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-text-subtle hover:text-text-muted transition-colors"
            >
              Powered by <span className="text-gold font-medium">ultralink</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
