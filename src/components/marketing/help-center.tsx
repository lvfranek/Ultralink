"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HELP_SECTIONS, type HelpVideo } from "@/lib/config/help-content";
import { YouTubeThumbnail } from "@/components/youtube-thumbnail";
import { VideoLightbox } from "@/components/video-lightbox";
import { cx, spotlight } from "@/components/marketing/landing/shared";
import s from "@/components/marketing/landing/landing.module.css";

function VideoCard({ video, onPlay }: { video: HelpVideo; onPlay: () => void }) {
  const comingSoon = video.youtubeId === "PLACEHOLDER";
  return (
    <div className={cx(s.card, s.videoCard)} onPointerMove={spotlight}>
      <YouTubeThumbnail youtubeId={video.youtubeId} title={video.title} onPlay={onPlay} comingSoon={comingSoon} />
      <div className="relative mt-3 px-1 pb-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[15px] font-medium text-white">{video.title}</p>
          {/* Unpublished videos already say "Coming soon" on the thumbnail */}
          {!comingSoon && <span className="text-xs shrink-0 text-[#a1a1aa]">{video.duration}</span>}
        </div>
        {video.description && <p className="text-[13px] mt-1.5 leading-relaxed text-[#a1a1aa]">{video.description}</p>}
      </div>
    </div>
  );
}

export function HelpCenter() {
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<HelpVideo | null>(null);
  const [activeSection, setActiveSection] = useState(HELP_SECTIONS[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const query = search.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!query) return HELP_SECTIONS;
    return HELP_SECTIONS.map((section) => ({
      ...section,
      videos: section.videos.filter((v) => v.title.toLowerCase().includes(query)),
    })).filter((section) => section.videos.length > 0);
  }, [query]);

  const hasResults = filteredSections.length > 0;

  useEffect(() => {
    if (query) return; // scrollspy only makes sense when all sections are visible

    const intersecting = new Set<string>();

    const pickActive = () => {
      // Near the bottom of the page the last section may be too short to ever
      // enter the intersection band above, so fall back to it explicitly.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActiveSection(HELP_SECTIONS[HELP_SECTIONS.length - 1].id);
        return;
      }
      // Otherwise use the bottom-most section currently in the band, since
      // several sections can intersect it at once while scrolling.
      for (let i = HELP_SECTIONS.length - 1; i >= 0; i--) {
        if (intersecting.has(HELP_SECTIONS[i].id)) {
          setActiveSection(HELP_SECTIONS[i].id);
          return;
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        pickActive();
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const section of HELP_SECTIONS) {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    }

    window.addEventListener("scroll", pickActive, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", pickActive);
    };
  }, [query]);

  return (
    <>
      {/* Hero */}
      <section className={s.helpHero} aria-label="Help Center hero">
        <div className={s.aurora} aria-hidden="true">
          <span className={s.blobA} />
          <span className={s.blobB} />
        </div>
        <div className={s.grid} aria-hidden="true" />
        <div className={s.helpHeroInner}>
          <p className={s.eyebrow}>Help Center</p>
          <h1 className={s.h2}>
            Learn Ultralink
            <br />
            <em className={s.serifAccent}>in a few minutes.</em>
          </h1>
          <p className={s.helpLead}>Short video walkthroughs for everything from your first link to Win-Back.</p>
          <div className={s.helpSearch}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3.5 3.5" strokeLinecap="round" />
            </svg>
            {/* 16px font: anything smaller makes iOS Safari zoom in on focus */}
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search videos…"
              aria-label="Search help videos"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section aria-label="Help sections">
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px 120px" }}>
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Section nav */}
            <nav
              className="lg:w-48 shrink-0 lg:sticky lg:top-28 lg:self-start -mx-1 lg:mx-0 overflow-x-auto lg:overflow-visible"
              aria-label="Help sections navigation"
            >
              <ul className="flex lg:flex-col gap-1.5 lg:gap-1 px-1 lg:px-0 pb-2 lg:pb-0">
                {HELP_SECTIONS.map((section) => (
                  <li key={section.id} className="shrink-0">
                    <a
                      href={`#${section.id}`}
                      className={cx(
                        "block whitespace-nowrap lg:whitespace-normal px-3.5 py-2 text-sm rounded-full lg:rounded-[10px] transition-colors",
                        s.helpNavLink,
                        activeSection === section.id && !query && s.helpNavActive,
                      )}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Sections */}
            <div className="flex-1 min-w-0 space-y-16">
              {!hasResults && (
                <div className={cx(s.card, "text-center")}>
                  <p className="relative text-sm text-[#a1a1aa]">No videos match that search.</p>
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="relative mt-2 text-sm font-medium cursor-pointer text-white underline underline-offset-2"
                  >
                    Clear search
                  </button>
                </div>
              )}

              {filteredSections.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  ref={(el) => {
                    sectionRefs.current[section.id] = el;
                  }}
                  className="scroll-mt-28"
                >
                  <h2 className="text-2xl font-medium tracking-[-0.02em] text-white">{section.title}</h2>
                  <p className="mt-1.5 text-[15px] text-[#a1a1aa]">{section.description}</p>
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {section.videos.map((video) => (
                      <VideoCard key={video.id} video={video} onPlay={() => setPlaying(video)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {playing && (
        <VideoLightbox youtubeId={playing.youtubeId} title={playing.title} onClose={() => setPlaying(null)} />
      )}
    </>
  );
}
