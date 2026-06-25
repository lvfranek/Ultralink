"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/config/site";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  Support: [
    { label: "Contact", href: `mailto:${siteConfig.supportEmail}` },
    { label: "Agency news", href: siteConfig.socialLinks.telegram },
  ],
};

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const external = href.startsWith("http") || href.startsWith("mailto");
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: 14,
        color: hovered ? '#ffffff' : '#9A9A9A',
        textDecoration: 'none',
        transition: 'color 0.15s',
      }}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,.08)' }}
      aria-label="Footer"
    >
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '56px 24px 40px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 40,
          }}
        >
          {/* Brand column */}
          <div style={{ gridColumn: 'span 1' }}>
            <Logo onDark className="mb-4" />
            <p style={{ fontSize: 14, color: '#9A9A9A', lineHeight: 1.6, maxWidth: 220, marginTop: 16 }}>
              One link for everything you do.
              <br />
              Fast, beautiful, and built to keep your accounts safe.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(154,154,154,0.5)', marginBottom: 16 }}>
                {category}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,.06)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <p style={{ fontSize: 12, color: 'rgba(154,154,154,0.55)', margin: 0 }}>
            &copy; {year} Ultralink. All rights reserved.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(154,154,154,0.55)', margin: 0 }}>
            Built for influencer agencies.
          </p>
        </div>
      </div>
    </footer>
  );
}
