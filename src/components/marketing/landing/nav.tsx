"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { cx } from "./shared";
import s from "./landing.module.css";

const SECTIONS = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

/** `home` = rendered on the homepage, where section links are same-page anchors */
export function Nav({ home }: { home: boolean }) {
  const base = home ? "" : "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <header className={cx(s.nav, (scrolled || menuOpen) && s.navScrolled)}>
      <div className={s.navInner}>
        <Logo onDark capitalized href={home ? "#top" : "/"} />
        <nav className={s.navLinks} aria-label="Primary">
          {SECTIONS.map((l) => (
            <a key={l.href} href={base + l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className={s.navCta}>
          <Link href="/login" className={s.navLogin}>
            Log in
          </Link>
          <Link href="/login?mode=signup" className={s.btnLight}>
            Get started <ArrowRight size={15} strokeWidth={2.25} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className={s.menuBtn}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile menu — inert while closed so Tab and screen readers skip it */}
        <nav aria-label="Mobile" className={cx(s.mobileMenu, menuOpen && s.mobileMenuOpen)} inert={!menuOpen}>
          {SECTIONS.map((l) => (
            <a key={l.href} href={base + l.href} onClick={close}>
              {l.label}
            </a>
          ))}
          <Link href="/login" onClick={close}>
            Log in
          </Link>
        </nav>
      </div>
    </header>
  );
}
