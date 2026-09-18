import Link from "next/link";
import { Logo } from "@/components/logo";
import type { Metadata } from "next";
import { getLegalContact } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Imprint",
  description: "Legal notice (Imprint) for Ultralink as required by German law.",
};

export default function ImprintPage() {
  const contact = getLegalContact();

  return (
    <div className="min-h-dvh bg-bg dark-theme">
      {/* Minimal header */}
      <header className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Logo onDark />
          <Link href="/" className="text-sm text-text-muted hover:text-text transition-colors">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h1
          className="text-4xl sm:text-5xl font-bold text-text mb-3"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Imprint
        </h1>
        <p className="text-text-muted mb-12">Legal notice as required by German law.</p>

        {contact ? (
          <div className="space-y-10 text-text-muted leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-text mb-4">Information pursuant to § 5 DDG</h2>
              <address className="not-italic">
                Ultralink
                <br />
                Owner: {contact.name}
                <br />
                {contact.street}
                <br />
                {contact.city}
                <br />
                {contact.country}
              </address>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text mb-4">Contact</h2>
              <p>
                Email:{" "}
                <a
                  href={`mailto:${contact.email}`}
                  className="text-gold underline underline-offset-2 hover:text-gold-bright transition-colors"
                >
                  {contact.email}
                </a>
                {contact.phone && (
                  <>
                    <br />
                    Phone: {contact.phone}
                  </>
                )}
              </p>
            </section>

            {contact.vatId && (
              <section>
                <h2 className="text-xl font-semibold text-text mb-4">VAT ID</h2>
                <p>VAT identification number pursuant to § 27a UStG: {contact.vatId}</p>
              </section>
            )}

            <section>
              <h2 className="text-xl font-semibold text-text mb-4">Consumer dispute resolution</h2>
              <p>
                We are neither willing nor obliged to participate in dispute resolution proceedings
                before a consumer arbitration board.
              </p>
            </section>
          </div>
        ) : (
          <div className="p-4 rounded-[var(--radius)] border border-amber-700/40 bg-amber-950/20">
            <p className="text-sm text-amber-400 font-medium">Imprint not configured</p>
            <p className="text-xs text-amber-400/80 mt-1">
              Set <code>IMPRINT_NAME</code>, <code>IMPRINT_STREET</code> and <code>IMPRINT_CITY</code> in
              your environment (see <code>.env.example</code>) to show the operator&apos;s details here.
            </p>
          </div>
        )}
      </main>

      {/* Simple footer */}
      <footer className="border-t border-border px-4 sm:px-6 py-6 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <Logo iconSize={20} onDark />
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-text transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-text transition-colors">Privacy Policy</Link>
            <Link href="/imprint" className="hover:text-text transition-colors">Imprint</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
