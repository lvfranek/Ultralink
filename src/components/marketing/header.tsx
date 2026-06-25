"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            padding: "22px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          {/* Logo — left, wrapped in matching glass pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,.05)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,.10)',
              borderRadius: 999,
              padding: '8px 14px',
            }}
          >
            <Logo onDark />
          </div>

          {/* Glass pill — right (desktop) */}
          <div
            style={{
              alignItems: "center",
              gap: 2,
              background: "rgba(255,255,255,.05)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,.10)",
              borderRadius: 999,
              padding: 5,
            }}
            className="hidden md:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: "#cfcfcf",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "8px 14px",
                  borderRadius: 999,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#cfcfcf")}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              style={{
                color: "#cfcfcf",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                padding: "8px 14px",
                borderRadius: 999,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#cfcfcf")}
            >
              Login
            </Link>
            <Link
              href="/login"
              style={{
                background: "#fff",
                color: "#0A0A0A",
                fontWeight: 600,
                borderRadius: 999,
                padding: "8px 15px",
                fontSize: 14,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Sign up for free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            style={{
              background: "rgba(255,255,255,.05)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255,255,255,.10)",
              borderRadius: 999,
              padding: "10px 14px",
              cursor: "pointer",
              color: "#fff",
            }}
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
        aria-hidden={!mobileOpen}
      >
        <nav
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
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.10)" }}>
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
              href="/login"
              onClick={() => setMobileOpen(false)}
              style={{
                background: "#fff",
                color: "#0A0A0A",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 600,
                padding: "14px 16px",
                textAlign: "center",
                borderRadius: 999,
              }}
            >
              Sign up for free
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
