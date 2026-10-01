import type { ReactNode } from "react";
import { SiteShell } from "./shell";
import s from "./landing.module.css";

/** Frame for Privacy, Terms and Imprint: site nav and footer around a readable text column. */
export function LegalLayout({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <>
      {/* Invisible until focused with Tab — lets keyboard users jump past the menu */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to main content
      </a>
      <SiteShell>
        <main id="main">
          <header className={s.legalHead}>
            <div className={s.aurora} aria-hidden="true">
              <span className={s.blobA} />
              <span className={s.blobB} />
            </div>
            <div className={s.grid} aria-hidden="true" />
            <div className={s.legalHeadInner}>
              <p className={s.eyebrow}>Legal</p>
              <h1 className={s.h2}>{title}</h1>
              <p className={s.legalIntro}>{intro}</p>
            </div>
          </header>
          {/* dark-theme supplies the text/surface tokens the legal copy is styled with */}
          <div className={`dark-theme ${s.legalBody}`}>{children}</div>
        </main>
      </SiteShell>
    </>
  );
}
