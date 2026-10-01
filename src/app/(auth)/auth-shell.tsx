import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { PhoneMockup } from "@/components/marketing/phone-mockup";
import site from "@/components/marketing/landing/landing.module.css";
import s from "./auth-shell.module.css";

export const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,.10)",
  color: "#ffffff",
  borderRadius: 10,
  padding: "12px 14px",
  // 16px, not 14px: anything smaller makes iOS Safari zoom in on focus
  fontSize: 16,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  border: "1px solid rgba(248,113,113,0.55)",
};

/**
 * Frame for the sign-in / sign-up / password pages: form card on the left,
 * brand panel with a phone preview on the right (desktop only). Pass
 * `previewUsername` to show the name being claimed on the phone.
 */
export function AuthShell({
  children,
  footer,
  previewUsername,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  previewUsername?: string;
}) {
  return (
    <div className={site.root}>
      <div className={site.noise} aria-hidden="true" />
      <div className={s.layout}>
        <div className={s.formCol}>
          <div className={s.topBar}>
            <Logo href="/" onDark />
            <Link href="/" className={s.back}>
              <ArrowLeft size={15} aria-hidden="true" />
              Back to home
            </Link>
          </div>

          <main className={s.formMain}>
            <div className={s.card}>
              <span className={site.spinner} aria-hidden="true" />
              <div className={s.cardInner}>{children}</div>
            </div>
            {footer}
          </main>
        </div>

        <aside className={s.panel} aria-hidden="true">
          <div className={site.aurora}>
            <span className={site.blobA} />
            <span className={site.blobB} />
            <span className={site.blobC} />
          </div>
          <div className={site.grid} />
          <div className={s.panelCopy}>
            <p className={s.panelTitle}>
              Your audience is
              <br />
              <em className={site.serifAccent}>one tap away.</em>
            </p>
            <p className={s.panelSub}>Free forever · No card needed · Live in 60 seconds</p>
          </div>
          <div className={s.panelPhone}>
            <PhoneMockup username={previewUsername} />
          </div>
        </aside>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
