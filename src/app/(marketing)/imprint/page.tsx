import type { Metadata } from "next";
import { LegalLayout } from "@/components/marketing/landing/legal-layout";
import { getLegalContact } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Imprint",
  description: "Legal notice (Imprint) for Ultralink as required by German law.",
  alternates: { canonical: "/imprint" },
};

export default function ImprintPage() {
  const contact = getLegalContact();

  return (
    <LegalLayout title="Imprint" intro={<>Legal notice as required by German law.</>}>
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
              We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer
              arbitration board.
            </p>
          </section>
        </div>
      ) : (
        <div className="p-4 rounded-[var(--radius)] border border-amber-700/40 bg-amber-950/20">
          <p className="text-sm text-amber-400 font-medium">Imprint not configured</p>
          <p className="text-xs text-amber-400/80 mt-1">
            Set <code>IMPRINT_NAME</code>, <code>IMPRINT_STREET</code> and <code>IMPRINT_CITY</code> in your environment
            (see <code>.env.example</code>) to show the operator&apos;s details here.
          </p>
        </div>
      )}
    </LegalLayout>
  );
}
