import Link from "next/link";
import { Logo } from "@/components/logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Ultralink Terms of Service — rules, rights, and responsibilities.",
};

export default function TermsPage() {
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
        {/* Lawyer review banner */}
        <div className="mb-10 p-4 rounded-[var(--radius)] border border-amber-700/40 bg-amber-950/20">
          <p className="text-sm text-amber-400 font-medium">
            ⚠ Legal review required
          </p>
          <p className="text-xs text-amber-400/80 mt-1">
            This is a template generated for the operator and must be reviewed by a qualified
            lawyer before launch. It is provided as a starting point only and does not constitute
            legal advice.
          </p>
        </div>

        <h1
          className="text-4xl sm:text-5xl font-bold text-text mb-3"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Terms of Service
        </h1>
        <p className="text-text-muted mb-12">
          Last updated: {new Date().toLocaleDateString("en-DE", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-10 text-text-muted leading-relaxed">

          {/* Intro */}
          <section>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your use of Ultralink, a hosted
              link-in-bio service operated by Franciszek Kaminski, sole proprietor
              (Einzelunternehmer), Germany (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;Ultralink&rdquo;). By creating an
              account or using the service, you agree to these Terms. If you do not agree,
              do not use Ultralink.
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">1. Account Terms</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>You must be at least 18 years old to create an account.</li>
              <li>You must provide a valid email address and maintain its accuracy.</li>
              <li>You are responsible for maintaining the confidentiality of your password and for all activity that occurs under your account.</li>
              <li>You may not create accounts using automated means or under false pretences.</li>
              <li>One person or legal entity may not maintain more than one free account. Agency workspaces are separate from personal accounts and subject to the applicable plan terms.</li>
              <li>You must notify us immediately at support@ultralink.bio of any unauthorised access to your account.</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">2. Acceptable Use</h2>
            <p className="mb-3">You may use Ultralink only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                <span className="font-medium text-text">Upload, link to, or publish illegal content</span> — including content that violates copyright, constitutes harassment, defamation, hate speech, or is otherwise prohibited by applicable law.
              </li>
              <li>
                <span className="font-medium text-text">Publish malware, phishing, or deceptive content</span> — any content designed to deceive end users about its origin, purpose, or destination.
              </li>
              <li>
                <span className="font-medium text-text">Cloak your links</span> — you may not use Ultralink to serve different content or URLs to platform crawlers (Instagram, TikTok, etc.) than those served to human visitors. This includes but is not limited to: JavaScript-based redirect masking, user-agent switching, or any technique that deceives automated systems about a link&apos;s real destination. Violation of this rule will result in immediate account termination.
              </li>
              <li>
                <span className="font-medium text-text">Publish adult or sexually explicit content without the age gate</span> — if your link page contains or links to adult content, you must enable the Ultralink age gate. Adult content is permitted only where lawful in your jurisdiction and in the jurisdictions of your audience, and only behind the age gate.
              </li>
              <li>Interfere with or disrupt the integrity or performance of the service.</li>
              <li>Attempt to gain unauthorised access to any system, account, or data.</li>
              <li>Use the service in any manner that could damage, disable, overburden, or impair it.</li>
              <li>Scrape or harvest data from the service without written permission.</li>
            </ul>
            <p className="mt-4">
              We reserve the right to remove any content that violates these rules and to suspend or
              terminate accounts accordingly, without notice, at our sole discretion.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">3. Subscriptions and Billing</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Paid plans are billed in advance on a monthly or annual basis. Prices are shown in USD and are inclusive of any applicable VAT where required by law.</li>
              <li>The Creator plan includes a 7-day free trial. No charge is made until the trial ends. If you cancel before the trial ends, you will not be charged.</li>
              <li>By providing payment details, you authorise us to charge your payment method for the applicable subscription fee at the start of each billing period.</li>
              <li>All prices may change with 30 days&apos; notice to existing subscribers. Continued use after the notice period constitutes acceptance of the new price.</li>
              <li>We use Stripe to process payments. Your payment data is subject to Stripe&apos;s privacy policy and terms. We do not store your full payment card details.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">4. Cancellation and Refunds</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>You may cancel your subscription at any time from your account settings.</li>
              <li>Cancellation takes effect at the end of the current billing period. You retain access to paid features until then.</li>
              <li>Monthly subscriptions: no refunds for partial months.</li>
              <li>Annual subscriptions: no refunds, except as required by applicable consumer protection law in your jurisdiction (including EU consumer rights).</li>
              <li>If you cancel the Creator free trial before it expires, you will not be charged and your account reverts to the Free plan.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">5. Intellectual Property</h2>
            <p>
              The Ultralink service, including its software, design, trademarks, and content created
              by us, is owned by Franciszek Kaminski and protected by applicable intellectual property
              laws.
            </p>
            <p className="mt-3">
              You retain all rights to the content you publish through Ultralink. By publishing
              content, you grant us a limited, non-exclusive, worldwide, royalty-free licence to
              host, store, display, and deliver your content solely for the purpose of operating the
              service. This licence ends when you delete the content or close your account.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">6. Disclaimers and Limitation of Liability</h2>
            <p>
              The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranty of any kind,
              express or implied, including but not limited to warranties of merchantability, fitness
              for a particular purpose, or non-infringement.
            </p>
            <p className="mt-3">
              To the maximum extent permitted by applicable law, Ultralink shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages, including loss
              of profits, data, goodwill, or other intangible losses, arising from your use of or
              inability to use the service.
            </p>
            <p className="mt-3">
              Our total liability to you for any claim arising out of or related to these Terms or
              the service shall not exceed the amount you paid us in the 12 months preceding the
              claim.
            </p>
            <p className="mt-3 text-sm text-text-subtle">
              Note: Certain consumer protection laws in Germany and the EU may limit our ability to
              exclude or restrict liability. The exclusions above apply to the fullest extent
              permitted by law.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">7. Termination</h2>
            <p>
              We may suspend or terminate your account immediately, without prior notice or liability,
              for any reason including — but not limited to — breach of these Terms, especially
              violations of the acceptable use policy.
            </p>
            <p className="mt-3">
              You may terminate your account at any time by deleting it in account settings or by
              emailing support@ultralink.bio. Upon termination, your right to use the service
              ceases immediately, and your data will be deleted in accordance with our Privacy Policy.
            </p>
            <p className="mt-3">
              Provisions that by their nature should survive termination — including intellectual
              property, disclaimers, limitation of liability, and governing law — will survive.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">8. Governing Law and Jurisdiction</h2>
            <p>
              These Terms are governed by the laws of Germany, without regard to its conflict-of-law
              provisions. Any disputes shall be subject to the exclusive jurisdiction of the courts
              of Germany, except where mandatory consumer protection laws in your country of
              residence provide otherwise.
            </p>
            <p className="mt-3">
              For EU consumers, you may also use the European Commission&apos;s Online Dispute Resolution
              (ODR) platform at{" "}
              <span className="text-text-muted font-mono text-sm">https://ec.europa.eu/consumers/odr</span>.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">9. Changes to These Terms</h2>
            <p>
              We may modify these Terms at any time. We will provide at least 30 days&apos; notice of
              material changes via email or a prominent in-app notice. Continued use of the service
              after the effective date of changes constitutes acceptance. If you do not agree to the
              modified Terms, you must stop using the service and may cancel your subscription.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-text mb-4">10. Contact</h2>
            <p>
              Questions about these Terms? Email us at{" "}
              <a href="mailto:support@ultralink.bio" className="text-gold hover:text-gold-bright transition-colors">
                support@ultralink.bio
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Simple footer */}
      <footer className="border-t border-border px-4 sm:px-6 py-6 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-subtle">
          <Logo iconSize={20} onDark />
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-text transition-colors text-text-muted">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-text transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
