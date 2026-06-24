"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "What is Ultralink?",
    answer:
      "Ultralink is a link-in-bio platform. You create one fast-loading page with all your important links, then put that single URL in your Instagram, TikTok, or Twitter bio. When someone clicks it, they see everything you want to share — content, products, social profiles, and more.",
  },
  {
    question: "Do I need a credit card for the free plan?",
    answer:
      "No. The Free plan is genuinely free — no credit card required, no trial period, no automatic upgrade. Use it as long as you like. When you're ready for analytics, custom domains, or other premium features, upgrade to Creator or Agency at any time.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes. Creator and Agency plans both include custom domain support. Instead of ultralink.bio/yourname, you can use something like links.yourbrand.com. We provide simple DNS setup instructions and the domain propagates within minutes.",
  },
  {
    question: "Will using Ultralink get my Instagram or TikTok banned?",
    answer:
      "No — and this is something we take seriously. Many link-in-bio tools use 'link cloaking,' which means they show Instagram or TikTok's crawlers a different URL than your real visitors see. This violates platform terms of service and leads to permanent bans. Ultralink explicitly does not cloak. Crawlers and users always see the same destination. Your account is safe.",
  },
  {
    question: "What is Win-Back?",
    answer:
      "Win-Back is an Agency-exclusive feature that gives you a second chance with visitors who start to leave your link page. When a visitor tries to navigate away, they see a clean prompt offering an alternative destination — a different offer, product, or channel. It recovers traffic that would otherwise be lost.",
  },
  {
    question: "Can my team manage our link pages?",
    answer:
      "Team access is available on the Agency plan. You can invite team members — virtual assistants, social media managers, or colleagues — and they can manage link pages without access to your billing or account settings.",
  },
  {
    question: "How does the Creator 7-day free trial work?",
    answer:
      "When you sign up for the Creator plan, you get 7 days of full access at no charge. No credit card is required until the trial ends. If you don't continue, your account reverts to the Free plan — you won't be charged. If you do continue, billing starts on day 8.",
  },
  {
    question: "How do I cancel?",
    answer:
      "Cancel any time from your account settings — no need to contact support. If you cancel a paid plan, you keep access until the end of your billing period. No cancellation fees. Annual plans are non-refundable except as required by law.",
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
      className="px-6 pb-16 sm:pb-20"
      aria-labelledby="faq-heading"
    >
      <div
        className="px-8 sm:px-12 py-12 sm:py-14"
        style={{
          maxWidth: 1100,
          margin: '40px auto',
          background: '#FFFFFF',
          border: '1px solid #E4E4E7',
          borderRadius: 24,
          boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 10px 30px -18px rgba(0,0,0,.12)',
        }}
      >
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-xs tracking-widest uppercase text-text-subtle font-medium mb-4">FAQ</p>
          <h2
            id="faq-heading"
            className="text-4xl sm:text-5xl font-black text-text tracking-tight"
          >
            Questions answered.
          </h2>
        </div>

        {/* Accordion */}
        <dl className="space-y-2 max-w-3xl mx-auto">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                className={`rounded-[var(--radius)] border transition-all duration-150 ${
                  isOpen
                    ? "border-border-strong bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
                    : "border-[#E4E4E7] bg-white hover:border-border-strong"
                }`}
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
                    <span className="text-text-muted">
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
