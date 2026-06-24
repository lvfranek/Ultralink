import Link from "next/link";
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

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative border-t border-border bg-surface"
      aria-label="Footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-10 sm:gap-12">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1">
            <Logo className="mb-4" />
            <p className="text-sm text-text-muted leading-relaxed max-w-[220px]">
              One link for everything you do.
              <br />
              Fast, beautiful, and built to keep your accounts safe.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-subtle mb-4">
                {category}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-muted hover:text-text transition-colors duration-150"
                      {...(link.href.startsWith("http") || link.href.startsWith("mailto")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-subtle">
            &copy; {year} Ultralink. All rights reserved.
          </p>
          <p className="text-xs text-text-subtle">
            Built for creators who keep their accounts.
          </p>
        </div>
      </div>
    </footer>
  );
}
