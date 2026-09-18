import Link from "next/link";
import { Logo } from "@/components/logo";
import type { Metadata } from "next";
import { getLegalContact } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ultralink collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-text-muted mb-12">
          Last updated: {new Date().toLocaleDateString("en-DE", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="max-w-none space-y-10 text-text-muted leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">1. Data Controller</h2>
            <p>
              The data controller responsible for processing your personal data is:
            </p>
            <address className="not-italic mt-3 p-4 bg-surface rounded-[var(--radius)] border border-border text-sm">
              {contact ? (
                <>
                  {contact.name}<br />
                  {contact.street}<br />
                  {contact.city}<br />
                  {contact.country}<br />
                </>
              ) : (
                <>
                  The operator of this site — see the <Link href="/imprint" className="text-gold underline underline-offset-2 hover:text-gold-bright transition-colors">Imprint</Link>.<br />
                </>
              )}
              Email: <a href="mailto:support@ultralink.bio" className="text-gold underline underline-offset-2 hover:text-gold-bright transition-colors">support@ultralink.bio</a>
            </address>
            <p className="mt-4">
              For all data protection enquiries, including the exercise of your data subject rights,
              please contact us at the email address above.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">2. Personal Data We Collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                ["Account data", "Your email address, display name, and — if you register via Google OAuth — your Google profile name and profile picture URL."],
                ["Link page content", "The links, text, images, and configuration you choose to publish on your Ultralink page. This content is stored by us to operate the service."],
                ["Usage analytics", "Aggregated and per-link click counts, referring social platforms, approximate geographic location derived from IP address (country level), device type (mobile/desktop), and browser type."],
                ["IP address", "Temporarily recorded for security, rate-limiting, fraud prevention, and for deriving country-level geo-data used in your analytics dashboard. Not stored long-term beyond what is necessary for these purposes."],
                ["Cookies and session data", "Session tokens and authentication cookies are used to keep you logged in. See Section 8 for details."],
                ["Billing data", "Payment processing is handled by Stripe. We do not store your full credit card number. We receive and retain limited transaction metadata (plan purchased, amount, date, Stripe customer ID) to manage your subscription."],
                ["Support communications", "If you contact us by email, we retain those communications to resolve your request."],
              ].map(([title, desc]) => (
                <li key={title as string} className="pl-4 border-l-2 border-border">
                  <span className="font-medium text-text">{title}:</span>{" "}
                  {desc}
                </li>
              ))}
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">3. Legal Bases for Processing</h2>
            <p>We process personal data on the following legal bases under the GDPR:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>
                <span className="font-medium text-text">Contract (Art. 6(1)(b) GDPR):</span> Processing necessary to provide the Ultralink service you signed up for — account management, delivering link pages, processing subscription payments.
              </li>
              <li>
                <span className="font-medium text-text">Legitimate interests (Art. 6(1)(f) GDPR):</span> Analytics to improve the service, security and fraud prevention, communicating service-critical updates.
              </li>
              <li>
                <span className="font-medium text-text">Consent (Art. 6(1)(a) GDPR):</span> Where we explicitly ask for consent — for example, for non-essential cookies or optional marketing communications. You may withdraw consent at any time.
              </li>
              <li>
                <span className="font-medium text-text">Legal obligation (Art. 6(1)(c) GDPR):</span> Retention of invoices and transaction records as required by German commercial and tax law.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">4. Sub-processors</h2>
            <p>
              We use the following third-party sub-processors to operate the service. Each has been
              selected for compliance with GDPR and appropriate security standards:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold text-text">Processor</th>
                    <th className="text-left py-2 pr-4 font-semibold text-text">Purpose</th>
                    <th className="text-left py-2 font-semibold text-text">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Supabase, Inc.", "Database storage and authentication", "USA (SCCs)"],
                    ["Stripe, Inc.", "Payment processing and subscription management", "USA (SCCs)"],
                    ["Resend, Inc.", "Transactional email delivery", "USA (SCCs)"],
                    ["Vercel, Inc.", "Cloud hosting and infrastructure", "USA (SCCs)"],
                    ["Google LLC", "OAuth authentication (sign-in with Google)", "USA (SCCs)"],
                  ].map(([name, purpose, loc]) => (
                    <tr key={name as string}>
                      <td className="py-2 pr-4 font-medium text-text">{name}</td>
                      <td className="py-2 pr-4">{purpose}</td>
                      <td className="py-2 text-text-muted">{loc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm">
              SCCs = EU Standard Contractual Clauses, providing an adequate legal mechanism for
              international transfers under GDPR Chapter V.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">5. International Data Transfers</h2>
            <p>
              As shown in Section 4, some of our sub-processors are based in the United States. These
              transfers are conducted under Standard Contractual Clauses (SCCs) approved by the
              European Commission, ensuring an adequate level of data protection. You may request
              a copy of the applicable SCCs by contacting us at support@ultralink.bio.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">6. Your Rights Under GDPR</h2>
            <p>As a data subject in the EU/EEA, you have the following rights:</p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                ["Right of access (Art. 15)", "Request a copy of your personal data that we hold."],
                ["Right to rectification (Art. 16)", "Request correction of inaccurate or incomplete data."],
                ["Right to erasure (Art. 17)", "Request deletion of your data (\"right to be forgotten\"), subject to legal retention obligations."],
                ["Right to data portability (Art. 20)", "Receive your data in a structured, machine-readable format."],
                ["Right to object (Art. 21)", "Object to processing based on legitimate interests."],
                ["Right to restriction (Art. 18)", "Request that we restrict processing of your data in certain circumstances."],
                ["Right to withdraw consent (Art. 7(3))", "Where processing is based on consent, withdraw it at any time without affecting the lawfulness of prior processing."],
                ["Right to lodge a complaint", "You have the right to complain to the competent supervisory authority. In Germany, this is the relevant Landesbeauftragter für den Datenschutz. You can also contact the European Data Protection Board (EDPB)."],
              ].map(([title, desc]) => (
                <li key={title as string} className="pl-4 border-l-2 border-border">
                  <span className="font-medium text-text">{title}:</span>{" "}
                  {desc}
                </li>
              ))}
            </ul>
            <p className="mt-4">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:support@ultralink.bio" className="text-gold underline underline-offset-2 hover:text-gold-bright transition-colors">
                support@ultralink.bio
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">7. Data Retention</h2>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Account data is retained for the duration of your account and deleted within 30 days of account deletion request, except where legal retention obligations apply.</li>
              <li>Analytics data (aggregated click data) is retained for up to 24 months and then deleted.</li>
              <li>Transaction and invoice records are retained for 10 years as required by German commercial law (§ 257 HGB) and tax law (§ 147 AO).</li>
              <li>Support communications are retained for up to 3 years after resolution.</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">8. Cookies</h2>
            <p>We use the following types of cookies:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>
                <span className="font-medium text-text">Strictly necessary cookies:</span> Session and authentication tokens issued by Supabase to keep you logged in. These cannot be disabled without breaking the service. No consent is required under GDPR for strictly necessary cookies.
              </li>
              <li>
                <span className="font-medium text-text">No tracking or advertising cookies:</span> We do not use third-party advertising cookies, social media tracking pixels, or behavioural profiling.
              </li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">9. Children&apos;s Privacy</h2>
            <p>
              Ultralink is not directed at children under the age of 16. We do not knowingly collect
              personal data from children. If you believe a child has provided us with personal data,
              please contact us and we will delete it promptly.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated
              to you by email or by a prominent notice on the service. The &ldquo;Last updated&rdquo; date at
              the top of this page reflects the date of the most recent revision. Continued use of the
              service after changes take effect constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">11. Contact</h2>
            <p>
              For any data protection questions, requests, or complaints, contact us at:{" "}
              <a href="mailto:support@ultralink.bio" className="text-gold underline underline-offset-2 hover:text-gold-bright transition-colors">
                support@ultralink.bio
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Simple footer */}
      <footer className="border-t border-border px-4 sm:px-6 py-6 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <Logo iconSize={20} onDark />
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-text transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-text transition-colors text-text-muted">Privacy Policy</Link>
            <Link href="/imprint" className="hover:text-text transition-colors">Imprint</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
