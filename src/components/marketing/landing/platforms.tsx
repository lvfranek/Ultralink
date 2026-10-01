"use client";

import { useEffect, useRef, useState } from "react";
import { SocialIcon } from "@/components/public/social-icon";
import { delay, prefersReducedMotion } from "./shared";
import s from "./landing.module.css";

// ─── Platforms marquee ───────────────────────────────────────────────────────

const PLATFORMS = [
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["x", "X"],
  ["youtube", "YouTube"],
  ["snapchat", "Snapchat"],
  ["threads", "Threads"],
  ["twitch", "Twitch"],
  ["onlyfans", "OnlyFans"],
  ["telegram", "Telegram"],
  ["pinterest", "Pinterest"],
] as const;

export function Platforms() {
  return (
    <section className={s.platforms} aria-label="Supported platforms">
      <p className={s.eyebrowCenter} data-reveal>
        One link. Every bio you own.
      </p>
      <div className={s.marquee} data-reveal style={delay(100)}>
        <div className={s.marqueeTrack}>
          {[0, 1].map((dup) => (
            <div key={dup} className={s.marqueeGroup} aria-hidden={dup === 1}>
              {PLATFORMS.map(([id, name]) => (
                <span key={id} className={s.platform}>
                  <SocialIcon platform={id} size={20} />
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={s.stats}>
        <Stat value={60} suffix="s" label="from sign-up to a live page" i={0} />
        <Stat value={0} prefix="$" label="to start — free forever" i={1} />
        <Stat value={400} label="link pages on a single account" i={2} />
      </div>
    </section>
  );
}

function Stat({
  value,
  prefix = "",
  suffix = "",
  label,
  i,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  i: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);

  // Count up once the number scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (prefersReducedMotion()) {
        setN(value);
        return;
      }
      const start = performance.now();
      const step = (t: number) => {
        const p = Math.min((t - start) / 1400, 1);
        setN(Math.round(value * (1 - Math.pow(1 - p, 4))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <div ref={ref} className={s.stat} data-reveal style={delay(i * 120)}>
      <div className={s.statValue}>
        {prefix}
        {n}
        {suffix}
      </div>
      <div className={s.statLabel}>{label}</div>
    </div>
  );
}
