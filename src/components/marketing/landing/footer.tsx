import Link from "next/link";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/config/site";
import s from "./landing.module.css";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Imprint", href: "/imprint" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact", href: `mailto:${siteConfig.supportEmail}` },
    ],
  },
];

/** `home` = rendered on the homepage, where section links are same-page anchors */
export function Footer({ home }: { home: boolean }) {
  const base = home ? "" : "/";
  return (
    <footer className={s.footer}>
      <div className={s.footerTop}>
        <div className={s.footerBrand}>
          <Logo onDark capitalized href={home ? "#top" : "/"} />
          <p>Send your audience anywhere, track every click, and keep full control of your traffic.</p>
        </div>
        <div className={s.footerCols}>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className={s.footerHead}>{col.title}</div>
              {col.links.map((l) =>
                l.href.startsWith("#") ? (
                  <a key={l.label} href={base + l.href}>
                    {l.label}
                  </a>
                ) : l.href.startsWith("/") ? (
                  <Link key={l.label} href={l.href}>
                    {l.label}
                  </Link>
                ) : (
                  <a key={l.label} href={l.href}>
                    {l.label}
                  </a>
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Copyright sits above the divider; the wordmark stands alone below it */}
      <div className={s.footerBottom}>© {new Date().getFullYear()} Ultralink. All rights reserved.</div>
      <div className={s.wordmark} aria-hidden="true">
        ULTRALINK
      </div>
    </footer>
  );
}
