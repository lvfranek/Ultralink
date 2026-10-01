"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Lock } from "lucide-react";
import { cx, delay } from "./shared";
import s from "./landing.module.css";

// ─── Sticky scroll story ─────────────────────────────────────────────────────

const STEPS = [
  {
    n: "01",
    title: "A fan taps your link.",
    body: "Inside Instagram, TikTok or X. Normally the app's in-app browser opens — slow, logged out, and built to keep them inside the app.",
  },
  {
    n: "02",
    title: "Ultralink opens the real browser.",
    body: "Deep linking hands the click straight to Safari or Chrome, where your fans are already logged in and ready to buy.",
  },
  {
    n: "03",
    title: "Nobody slips away.",
    body: "About to leave? Win-Back offers a second link before they go — and every single click lands in your analytics.",
  },
];

export function Story() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how" className={s.section} aria-labelledby="how-title">
      <div className={s.sectionHead}>
        <p className={s.eyebrow} data-reveal>
          How it works
        </p>
        <h2 id="how-title" className={s.h2} data-reveal style={delay(80)}>
          Built for the moment
          <br />
          <em className={s.serifAccent}>someone taps your link.</em>
        </h2>
      </div>

      <div className={s.story}>
        <div className={s.storyVisualCol}>
          <div className={s.storyVisual}>
            <div className={s.storyGlow} aria-hidden="true" />
            <StoryScene i={0} active={active}>
              <div className={s.igPost}>
                <div className={s.igHead}>
                  <span className={s.igAvatar}>ML</span>
                  <div>
                    <div className={s.igName}>mialaurent</div>
                    <div className={s.igBio}>Travel &amp; lifestyle ✈️</div>
                  </div>
                </div>
                <div className={s.igLink}>
                  <span className={s.tapRipple} aria-hidden="true" />
                  ultralink.bio/mialaurent
                </div>
                <div className={s.igImage} />
              </div>
            </StoryScene>
            <StoryScene i={1} active={active}>
              <div className={s.browser}>
                <div className={s.browserBar}>
                  <span className={s.dots}>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className={s.browserUrl}>
                    <Lock size={11} strokeWidth={2.5} aria-hidden="true" /> onlyfans.com/mialaurent
                  </span>
                </div>
                <div className={s.browserBody}>
                  <span className={cx(s.fcIcon, s.fcIconGreen, s.bigCheck)}>
                    <Check size={22} strokeWidth={3} />
                  </span>
                  <div className={s.browserTitle}>Opened in Safari</div>
                  <div className={s.browserSub}>Logged in · cookies intact · ready to subscribe</div>
                </div>
              </div>
            </StoryScene>
            <StoryScene i={2} active={active}>
              <div className={s.winback}>
                <div className={s.winbackModal}>
                  <div className={s.fcLabel}>Before you go</div>
                  <div className={s.winbackTitle}>Get 30% off my VIP page today</div>
                  <div className={s.winbackBtn}>Claim offer</div>
                </div>
                <div className={s.winbackStats}>
                  <div>
                    <div className={s.fcLabel}>Recovered</div>
                    <div className={s.fcBig}>214</div>
                  </div>
                  <div>
                    <div className={s.fcLabel}>CTR</div>
                    <div className={s.fcBig}>38.4%</div>
                  </div>
                </div>
              </div>
            </StoryScene>
          </div>
        </div>

        <div className={s.storySteps}>
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              data-step={i}
              className={cx(s.step, active === i && s.stepActive)}
            >
              <span className={s.stepNum}>{step.n}</span>
              <h3 className={s.stepTitle}>{step.title}</h3>
              <p className={s.stepBody}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryScene({ i, active, children }: { i: number; active: number; children: ReactNode }) {
  return (
    <div className={cx(s.scene, active === i && s.sceneActive, active > i && s.scenePast)} aria-hidden={active !== i}>
      {children}
    </div>
  );
}
