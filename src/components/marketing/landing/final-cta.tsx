"use client";

import { Claim, type SlugCheck } from "./shared";
import s from "./landing.module.css";

export function FinalCta({
  check,
  onUsername,
  onClaim,
}: {
  check: SlugCheck;
  onUsername: (raw: string) => void;
  onClaim: () => void;
}) {
  return (
    <section className={s.cta} aria-labelledby="cta-title">
      <div className={s.ctaCard} data-reveal>
        <div className={s.aurora} aria-hidden="true">
          <span className={s.blobA} />
          <span className={s.blobC} />
        </div>
        <h2 id="cta-title" className={s.ctaTitle}>
          Your audience is
          <br />
          <em className={s.serifAccent}>one tap away.</em>
        </h2>
        <p className={s.lead}>Claim your name before someone else does.</p>
        <div className={s.heroClaim}>
          <Claim id="cta-claim" check={check} onChange={onUsername} onClaim={onClaim} />
        </div>
      </div>
    </section>
  );
}
