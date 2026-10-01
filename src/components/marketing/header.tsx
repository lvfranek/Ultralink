"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Header({ capitalizedLogo = false }: { capitalizedLogo?: boolean } = {}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={scrolled ? "site-header is-scrolled" : "site-header"}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        <div
          className="site-header-inner"
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          {/* Left — logo + page sections */}
          <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
            <Logo onDark capitalized={capitalizedLogo} />
            <nav aria-label="Primary" className="hidden md:flex" style={{ alignItems: "center", gap: 36 }}>
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="site-nav-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right — sign up + login (desktop) */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 28 }}>
            <Link href="/login?mode=signup" className="site-signup">
              Sign up
            </Link>
            <Link href="/login" className="site-nav-link">
              Login
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="site-menu-btn inline-flex md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
                <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <style>{`
        /* Transparent over the dark page top; once scrolled over the white hero card
           the bar darkens so the light nav text stays readable. */
        .site-header {
          border-bottom: 1px solid transparent;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        /* Same height as the hero card's top offset (.hero-outer padding-top), so the
           nav items sit exactly centred in the dark gap above the card */
        .site-header-inner {
          height: 88px;
          transition: height 0.2s ease;
        }
        .site-header.is-scrolled .site-header-inner { height: 68px; }
        .site-header.is-scrolled {
          background: rgba(10,10,10,.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom-color: rgba(255,255,255,.08);
        }
        .site-nav-link {
          color: #b5b5b5;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.15s;
        }
        .site-nav-link:hover { color: #fff; }
        .site-signup {
          display: inline-flex;
          align-items: center;
          background: #fff;
          color: #0A0A0A;
          font-size: 14px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 10px;
          text-decoration: none;
          white-space: nowrap;
          /* Glow only on hover — same shadow layers at zero alpha so it fades in */
          box-shadow: 0 0 0 1px rgba(255,255,255,0), 0 0 16px rgba(255,255,255,0), 0 0 40px rgba(255,255,255,0);
          transition: box-shadow 0.25s ease, transform 0.15s ease;
        }
        .site-signup:hover {
          box-shadow: 0 0 0 1px rgba(255,255,255,.4), 0 0 16px rgba(255,255,255,.26), 0 0 40px rgba(255,255,255,.1);
        }
        .site-signup:active { transform: scale(0.97); }
        .site-menu-btn {
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.04);
          color: #fff;
          cursor: pointer;
        }
      `}</style>

      {/* Mobile menu */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 49,
          background: "rgba(10,10,10,0.97)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transition: "opacity 0.2s, pointer-events 0.2s",
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
        className="md:hidden"
        // inert (not just transparent) so Tab and screen readers skip the closed menu
        inert={!mobileOpen}
      >
        <nav
          aria-label="Mobile"
          style={{
            position: "absolute",
            top: 72,
            left: 0,
            right: 0,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                color: "#cfcfcf",
                textDecoration: "none",
                fontSize: 18,
                fontWeight: 500,
                padding: "14px 16px",
                borderRadius: 12,
              }}
            >
              {link.label}
            </Link>
          ))}
          <div
            style={{
              marginTop: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,.10)",
            }}
          >
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              style={{
                color: "#cfcfcf",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 500,
                padding: "14px 16px",
                textAlign: "center",
                borderRadius: 12,
              }}
            >
              Login
            </Link>
            <Link
              href="/login?mode=signup"
              onClick={() => setMobileOpen(false)}
              style={{
                background: "#fff",
                color: "#0A0A0A",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 600,
                padding: "14px 16px",
                textAlign: "center",
                borderRadius: 10,
              }}
            >
              Sign up
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
