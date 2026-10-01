import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/marketing/landing/shell";
import s from "@/components/marketing/landing/landing.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// Renders for unmatched URLs and any notFound() call (e.g. a missing/paused
// bio page), in the same frame as the rest of the marketing site.
export default function NotFound() {
  return (
    <>
      <SiteShell>
        <main id="main" className={s.notFound}>
          <div className={s.aurora} aria-hidden="true">
            <span className={s.blobA} />
            <span className={s.blobB} />
          </div>
          <div className={s.grid} aria-hidden="true" />
          <div className={s.notFoundInner}>
            <p className={s.notFoundCode} aria-hidden="true">
              404
            </p>
            <h1 className={s.h2}>Page not found.</h1>
            <p className={s.lead}>This page doesn&apos;t exist, or it may have moved.</p>
            <div className={s.notFoundActions}>
              <Link href="/" className={s.btnLight}>
                Back to home <ArrowRight size={16} strokeWidth={2.25} aria-hidden="true" />
              </Link>
              <Link href="/login?mode=signup" className={s.btnGhost}>
                Claim your own link
              </Link>
            </div>
          </div>
        </main>
      </SiteShell>
    </>
  );
}
