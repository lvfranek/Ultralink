"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "What is Ultralink?",
    answer:
      "Ultralink is a premium link-in-bio platform. You create one beautiful, fast-loading page that contains all your important links, then put that single URL in your Instagram, TikTok, or Twitter bio. When someone clicks it, they land on your page and can explore everything you want to share — content, products, social profiles, and more.",
  },
  {
    question: "Do I need a credit card for the free plan?",
    answer:
      "No. The Free plan is genuinely free — no credit card required, no trial period, no automatic upgrade. You can use it as long as you like. When you're ready for analytics, custom domains, or other premium features, you can upgrade to Creator or Agency at any time.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes. Creator and Agency plans both include custom domain support. Instead of ultralink.bio/yourname, you can use something like links.yourbrand.com. We provide simple DNS setup instructions and the domain propagates within minutes. Agency plans include one custom domain per link page.",
  },
  {
    question: "Will using Ultralink get my Instagram or TikTok banned?",
    answer:
      "No — and this is something we take seriously. Many link-in-bio tools use 'link cloaking,' which means they show Instagram or TikTok's crawlers a different URL than what your real visitors see. This is a direct violation of those platforms' terms of service, and it gets accounts permanently banned when detected. Ultralink explicitly does not cloak. Our redirects are fully honest: crawlers and users always see the same destination. Your account is safe.",
  },
  {
    question: "What is Win-Back?",
    answer:
      "Win-Back is an Agency-exclusive feature that gives you a second chance to convert visitors who start to leave your link page. When a visitor attempts to navigate away, they're shown a clean, non-intrusive prompt offering them an alternative destination — a different offer, a different product, or another channel. It recovers traffic that would otherwise be completely lost, without dark patterns or manipulation.",
  },
  {
    question: "Can my team manage our link pages?",
    answer:
      "Team access is available on the Agency plan. You can invite team members — virtual assistants, social media managers, or colleagues — and they can manage link pages within your workspace without access to your billing or account settings. Free and Creator plans are single-user.",
  },
  {
    question: "How does the Creator 7-day free trial work?",
    answer:
      "When you sign up for the Creator plan, you get 7 days of full access at no charge. No credit card is required until the trial ends. If you choose not to continue, your account automatically reverts to the Free plan — you won't be charged anything. If you do continue, billing starts on day 8.",
  },
  {
    question: "How do I cancel?",
    answer:
      "You can cancel any time from your account settings — no need to contact support. If you cancel a paid plan, you keep access until the end of your current billing period. There are no cancellation fees. Annual plans are non-refundable except as required by applicable law.",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
    </svg>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      id="faq"
      className="py-24 sm:py-32 px-4 sm:px-6"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest uppercase text-gold font-medium mb-4">FAQ</p>
          <h2
            id="faq-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-text"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Questions answered.
          </h2>
        </div>

        {/* Accordion */}
        <dl className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                className={`rounded-[var(--radius)] border transition-colors duration-150 ${isOpen ? "border-border-strong bg-surface" : "border-border bg-surface hover:border-border-strong"}`}
              >
                <dt>
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 cursor-pointer"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
                    id={`faq-question-${i}`}
                  >
                    <span className="text-sm font-medium text-text pr-2">
                      {faq.question}
                    </span>
                    <span className={`text-text-muted transition-colors duration-150 ${isOpen ? "text-gold" : ""}`}>
                      <ChevronIcon open={isOpen} />
                    </span>
                  </button>
                </dt>
                <dd
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96" : "max-h-0"}`}
                >
                  <p className="px-5 pb-5 text-sm text-text-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
