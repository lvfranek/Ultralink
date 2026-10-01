"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { PhoneMockup } from "@/components/marketing/phone-mockup";
import { Claim, cx, delay, prefersReducedMotion, type SlugCheck } from "./shared";
import s from "./landing.module.css";

// ─── Hero ────────────────────────────────────────────────────────────────────

export function Hero({
  check,
  onUsername,
  onClaim,
}: {
  check: SlugCheck;
  onUsername: (raw: string) => void;
  onClaim: () => void;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Stage tilts toward the cursor and straightens out as it scrolls into view
  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    if (!hero || !stage || prefersReducedMotion()) return;

    let tx = 0;
    let ty = 0;
    let cxv = 0;
    let cyv = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    const tick = () => {
      cxv += (tx - cxv) * 0.07;
      cyv += (ty - cyv) * 0.07;
      const r = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(Math.max((vh - r.top) / (vh * 0.85), 0), 1);
      stage.style.setProperty("--rx", `${(1 - p) * 22 - cyv * 4}deg`);
      stage.style.setProperty("--ry", `${cxv * 8}deg`);
      stage.style.setProperty("--sc", `${0.88 + p * 0.12}`);
      raf = requestAnimationFrame(tick);
    };

    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section ref={heroRef} className={s.hero} id="top" aria-label="Hero">
      <div className={s.aurora} aria-hidden="true">
        <span className={s.blobA} />
        <span className={s.blobB} />
        <span className={s.blobC} />
      </div>
      <div className={s.grid} aria-hidden="true" />

      <div className={s.heroCopy}>
        <a href="#how" className={s.announce} data-reveal>
          <span className={s.announceTag}>Pro</span>
          Win-Back catches visitors before they leave
          <ArrowRight size={14} aria-hidden="true" />
        </a>

        <h1 className={s.h1} data-reveal style={delay(80)}>
          The link in bio
          <br />
          that actually <em className={s.serifAccent}>converts.</em>
        </h1>

        <p className={s.lead} data-reveal style={delay(160)}>
          Send your audience anywhere, track every click, and keep full control of your traffic.
        </p>

        <div data-reveal style={delay(240)} className={s.heroClaim}>
          <Claim id="hero-claim" check={check} onChange={onUsername} onClaim={onClaim} />
        </div>

        <ul className={s.trust} data-reveal style={delay(320)}>
          {["Free forever", "No card needed", "Live in 60 seconds"].map((t) => (
            <li key={t}>
              <Check size={14} strokeWidth={2.5} aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {/* 3D product stage */}
      <div className={s.stageWrap} data-reveal style={delay(380)}>
        <div ref={stageRef} className={s.stage}>
          <div className={s.stageFloor} aria-hidden="true" />
          <div className={s.phoneSlot}>
            <PhoneMockup username={check.username} />
          </div>

          <FloatCard pos={s.fcA} z={120} bob={0}>
            <div className={s.fcRow}>
              <span className={cx(s.fcIcon, s.fcIconGreen)}>
                <Check size={14} strokeWidth={3} />
              </span>
              <div>
                <div className={s.fcTitle}>Opened in Safari</div>
                <div className={s.fcSub}>Escaped Instagram&apos;s in-app browser</div>
              </div>
            </div>
          </FloatCard>

          <FloatCard pos={s.fcB} z={70} bob={1}>
            <div className={s.fcLabel}>Clicks today</div>
            <div className={s.fcBig}>
              2,481 <span className={s.fcUp}>↑ 32%</span>
            </div>
            <svg viewBox="0 0 160 44" className={s.fcSpark} aria-hidden="true">
              <defs>
                <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#F7A8C4" stopOpacity=".45" />
                  <stop offset="100%" stopColor="#F7A8C4" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 36 L20 30 L40 33 L60 22 L80 25 L100 14 L120 18 L140 8 L160 4 L160 44 L0 44Z"
                fill="url(#sparkFill)"
              />
              <path
                d="M0 36 L20 30 L40 33 L60 22 L80 25 L100 14 L120 18 L140 8 L160 4"
                fill="none"
                stroke="#F7A8C4"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </FloatCard>

          <FloatCard pos={s.fcC} z={140} bob={2}>
            <div className={s.fcRow}>
              <span className={cx(s.fcIcon, s.fcIconPink)}>
                <Sparkles size={14} strokeWidth={2.5} />
              </span>
              <div>
                <div className={s.fcTitle}>Win-Back</div>
                <div className={s.fcSub}>214 visitors recovered this week</div>
              </div>
            </div>
          </FloatCard>

          <FloatCard pos={s.fcD} z={90} bob={3}>
            <div className={s.fcLabel}>Top countries</div>
            {[
              ["🇺🇸", "United States", 42],
              ["🇩🇪", "Germany", 18],
              ["🇬🇧", "United Kingdom", 11],
            ].map(([flag, name, pct]) => (
              <div key={name as string} className={s.fcCountry}>
                <span>{flag}</span>
                <span className={s.fcCountryName}>{name}</span>
                <span className={s.fcBar}>
                  <span style={{ width: `${(pct as number) * 2}%` }} />
                </span>
                <span className={s.fcPct}>{pct}%</span>
              </div>
            ))}
          </FloatCard>
        </div>
      </div>
    </section>
  );
}

function FloatCard({ pos, z, bob, children }: { pos: string; z: number; bob: number; children: ReactNode }) {
  return (
    <div className={cx(s.fc, pos)} style={{ "--z": `${z}px` } as CSSProperties} aria-hidden="true">
      <div className={s.fcInner} style={{ animationDelay: `${bob * -1.4}s` }}>
        {children}
      </div>
    </div>
  );
}
