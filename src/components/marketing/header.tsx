"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-bg/80 backdrop-blur-xl border-b border-border shadow-[0_1px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent",
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Logo />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm text-text-muted hover:text-text transition-colors duration-150 rounded-[var(--radius-sm)] hover:bg-surface-2"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm text-text-muted hover:text-text transition-colors duration-150 px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg whitespace-nowrap cursor-pointer px-3.5 py-1.5 text-sm rounded-[var(--radius-sm)] bg-gold text-bg hover:bg-gold-bright active:scale-[0.98] shadow-[0_1px_20px_rgba(201,168,106,0.25)]"
              >
                Get started
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-text-muted hover:text-text transition-colors rounded-[var(--radius-sm)]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className={`block h-0.5 bg-current transition-all duration-200 origin-center ${mobileOpen ? "rotate-45 translate-y-[7.5px]" : ""}`}
                />
                <span
                  className={`block h-0.5 bg-current transition-all duration-200 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`}
                />
                <span
                  className={`block h-0.5 bg-current transition-all duration-200 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[7.5px]" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0 bg-bg/90 backdrop-blur-xl"
          onClick={() => setMobileOpen(false)}
        />
        <nav
          className="absolute top-16 left-0 right-0 bg-surface border-b border-border p-6 flex flex-col gap-2"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-base text-text-muted hover:text-text transition-colors rounded-[var(--radius-sm)] hover:bg-surface-2"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-border">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 text-base text-text-muted hover:text-text transition-colors text-center"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center w-full gap-2 font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold whitespace-nowrap cursor-pointer px-7 py-3.5 text-base rounded-[var(--radius)] bg-gold text-bg hover:bg-gold-bright active:scale-[0.98] shadow-[0_1px_20px_rgba(201,168,106,0.25)]"
            >
              Get started free
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
