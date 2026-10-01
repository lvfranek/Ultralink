"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { SoonBadge, cx, delay, prefersReducedMotion, spotlight } from "./shared";
import s from "./landing.module.css";

// ─── Bento features ──────────────────────────────────────────────────────────

const DOMAINS = ["links.mialaurent.com", "go.studio-noir.co", "mia.vip"];

export function Bento() {
  return (
    <section id="features" className={s.section} aria-labelledby="features-title">
      <div className={s.sectionHead}>
        <p className={s.eyebrow} data-reveal>
          Features
        </p>
        <h2 id="features-title" className={s.h2} data-reveal style={delay(80)}>
          Everything you need.
          <br />
          <em className={s.serifAccent}>Nothing you don&apos;t.</em>
        </h2>
      </div>

      <div className={s.bento}>
        <Card className={s.span4} title="Real analytics" body="Clicks, CTR, countries, devices and top links — live.">
          <AnalyticsChart />
        </Card>

        <Card className={s.span2} title="Custom domains" body="Your brand, your URL." soon>
          <DomainBar />
        </Card>

        <Card className={s.span2} title="Active badge" body="Show fans you're online right now.">
          <div className={s.activeDemo}>
            <span className={s.activeAvatar}>ML</span>
            <span className={s.activePill}>
              <span className={s.activeDot} /> Active now
            </span>
          </div>
        </Card>

        <Card className={s.span2} title="Country blocking" body="Decide exactly who sees your page.">
          <CountryToggles />
        </Card>

        <Card className={s.span2} title="18+ age gate" body="A clean, compliant age check.">
          <div className={s.ageGate}>
            <div className={s.ageBadge}>18+</div>
            <div className={s.ageQ}>Are you 18 or older?</div>
            <div className={s.ageBtns}>
              <span>No</span>
              <span className={s.ageYes}>Yes, enter</span>
            </div>
          </div>
        </Card>

        <Card className={s.span3} title="Team access" body="Assistants manage links.">
          <div className={s.team}>
            {[
              ["ML", "Mia Laurent", "Owner", "#F59E8B"],
              ["JS", "Jordan S.", "Assistant", "#A78BFA"],
              ["KT", "Kai T.", "Manager", "#60A5FA"],
            ].map(([ini, name, role, color]) => (
              <div key={ini} className={s.teamRow}>
                <span className={s.teamAvatar} style={{ background: color }}>
                  {ini}
                </span>
                <span className={s.teamName}>{name}</span>
                <span className={s.teamRole}>{role}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className={s.span3} title="Designs that convert" body="Pick a preset or match your brand to the pixel.">
          <div className={s.themes}>
            {["#06AEEF", "#FF5A4E", "#34C28B", "#A78BFA"].map((c, i) => (
              <div key={c} className={s.themePhone} style={{ "--i": i - 1.5 } as CSSProperties}>
                <span className={s.themeAvatar} />
                <span className={s.themeLine} />
                {[0, 1, 2].map((k) => (
                  <span key={k} className={s.themeBtn} style={{ background: c }} />
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

function Card({
  className,
  title,
  body,
  soon = false,
  children,
}: {
  className: string;
  title: string;
  body: string;
  soon?: boolean;
  children: ReactNode;
}) {
  return (
    <article className={cx(s.card, className)} onPointerMove={spotlight} data-reveal>
      <div className={s.cardVisual}>{children}</div>
      <h3 className={s.cardTitle}>
        {title}
        {soon && <SoonBadge />}
      </h3>
      <p className={s.cardBody}>{body}</p>
    </article>
  );
}

function AnalyticsChart() {
  return (
    <div className={s.chart}>
      <div className={s.chartStats}>
        {[
          ["Visits", "48.2k"],
          ["Clicks", "31.9k"],
          ["CTR", "66.1%"],
        ].map(([k, v]) => (
          <div key={k}>
            <div className={s.fcLabel}>{k}</div>
            <div className={s.chartValue}>{v}</div>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 600 160" preserveAspectRatio="none" className={s.chartSvg} aria-hidden="true">
        <defs>
          <linearGradient id="chartStroke" x1="0" x2="1">
            <stop offset="0%" stopColor="#FBC2A4" />
            <stop offset="35%" stopColor="#F7A8C4" />
            <stop offset="70%" stopColor="#C9A7F2" />
            <stop offset="100%" stopColor="#A7C7F7" />
          </linearGradient>
          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#C9A7F2" stopOpacity=".28" />
            <stop offset="100%" stopColor="#C9A7F2" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[40, 80, 120].map((y) => (
          <line key={y} x1="0" x2="600" y1={y} y2={y} className={s.chartGrid} />
        ))}
        <path
          className={s.chartArea}
          d="M0 130 C60 120 90 98 140 104 S230 70 280 78 S370 40 420 52 S520 18 600 12 L600 160 L0 160Z"
          fill="url(#chartFill)"
        />
        <path
          className={s.chartLine}
          d="M0 130 C60 120 90 98 140 104 S230 70 280 78 S370 40 420 52 S520 18 600 12"
          fill="none"
          stroke="url(#chartStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={1}
        />
      </svg>
    </div>
  );
}

// Types each domain out character by character, holds it, then moves on to the next
const TICK_MS = 70;
const CYCLE_TICKS = 50;

function DomainBar() {
  const [tick, setTick] = useState(CYCLE_TICKS - 1);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => setTick((v) => v + 1), TICK_MS);
    return () => clearInterval(t);
  }, []);

  const domain = DOMAINS[Math.floor(tick / CYCLE_TICKS) % DOMAINS.length];
  const typed = domain.slice(0, tick % CYCLE_TICKS);

  return (
    <div className={s.domain}>
      <Lock size={13} strokeWidth={2.5} aria-hidden="true" className={s.domainLock} />
      <span className={s.domainText}>{typed}</span>
      <span className={s.caret} aria-hidden="true" />
    </div>
  );
}

function CountryToggles() {
  const [on, setOn] = useState<Record<string, boolean>>({
    "🇺🇸 United States": true,
    "🇩🇪 Germany": true,
    "🇷🇺 Russia": false,
  });
  return (
    <div className={s.countries}>
      {Object.entries(on).map(([name, enabled]) => (
        <button
          key={name}
          type="button"
          className={s.countryRow}
          onClick={() => setOn((o) => ({ ...o, [name]: !o[name] }))}
          aria-pressed={enabled}
        >
          <span>{name}</span>
          <span className={cx(s.toggle, enabled && s.toggleOn)} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
