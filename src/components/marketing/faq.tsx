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

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      style={{ maxWidth: 1140, margin: '0 auto', padding: '72px 24px 80px' }}
    >
      {/* Floating header — no wrapper box, eyebrow removed */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          id="faq-heading"
          style={{
            fontWeight: 500,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(28px, 4vw, 40px)',
            color: '#ffffff',
            margin: 0,
          }}
        >
          Questions answered.
        </h2>
      </div>

      {/* Accordion */}
      <dl
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: 760,
          margin: '0 auto',
        }}
      >
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={faq.question}
              style={{
                borderRadius: 12,
                border: isOpen
                  ? '1px solid rgba(255,255,255,.20)'
                  : '1px solid rgba(255,255,255,.10)',
                background: '#1A1A1A',
                transition: 'border-color 0.15s',
              }}
            >
              <dt>
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    textAlign: 'left',
                    gap: 16,
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    fontFamily: 'inherit',
                  }}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#ffffff', flex: 1 }}>
                    {faq.question}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                      color: '#9A9A9A',
                      transition: 'transform 0.2s',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                    }}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
                  </svg>
                </button>
              </dt>
              <dd
                id={`faq-answer-${i}`}
                role="region"
                aria-labelledby={`faq-question-${i}`}
                style={{
                  overflow: 'hidden',
                  maxHeight: isOpen ? 400 : 0,
                  transition: 'max-height 0.2s ease',
                }}
              >
                <p style={{ padding: '0 20px 18px', fontSize: 14, color: '#9A9A9A', lineHeight: 1.65, margin: 0 }}>
                  {faq.answer}
                </p>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
