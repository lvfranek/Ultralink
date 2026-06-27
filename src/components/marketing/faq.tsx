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
      "No. The Free plan is genuinely free — no credit card required, no trial period, no automatic upgrade. Use it as long as you like. When you're ready for analytics, custom domains, or other premium features, upgrade to Pro at any time.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes. The Pro plan includes custom domain support. Instead of ultralink.bio/yourname, you can use something like links.yourbrand.com. We provide simple DNS setup instructions and the domain propagates within minutes.",
  },
  {
    question: "Will using Ultralink get my Instagram or TikTok banned?",
    answer:
      "No — and this is something we take seriously. Many link-in-bio tools use link cloaking, which means they show Instagram or TikTok's crawlers a different URL than your real visitors see. This violates platform terms of service and leads to permanent bans. Ultralink explicitly does not cloak. Crawlers and users always see the same destination. Your account is safe.",
  },
  {
    question: "What is Win-Back?",
    answer:
      "Win-Back is a Pro feature that gives you a second chance with visitors who start to leave your link page. When a visitor tries to navigate away, they see a clean prompt offering an alternative destination — a different offer, product, or channel. It recovers traffic that would otherwise be lost.",
  },
  {
    question: "Can my team manage our link pages?",
    answer:
      "Team access is available on the Pro plan. You can invite team members — virtual assistants, social media managers, or colleagues — and they can manage link pages without access to your billing or account settings.",
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
      {/* Section header — floating on dark, like Features */}
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

      {/* White card accordion */}
      <div
        style={{
          background: '#fff',
          borderRadius: 28,
          border: '1px solid rgba(0,0,0,.06)',
          maxWidth: 760,
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        <dl style={{ margin: 0 }}>
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            const isLast = i === FAQS.length - 1;

            return (
              <div
                key={faq.question}
                style={{
                  borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,.06)',
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
                      padding: '20px 28px',
                      textAlign: 'left',
                      gap: 16,
                      cursor: 'pointer',
                      background: isOpen ? 'rgba(0,0,0,.03)' : 'transparent',
                      border: 'none',
                      fontFamily: 'inherit',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = 'rgba(0,0,0,.03)'; }}
                    onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
                    id={`faq-question-${i}`}
                  >
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: '#0A0A0A',
                        flex: 1,
                        lineHeight: 1.4,
                      }}
                    >
                      {faq.question}
                    </span>
                    <span
                      style={{
                        flexShrink: 0,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        style={{
                          width: 14,
                          height: 14,
                          color: '#6B6B6B',
                          transition: 'transform 0.22s cubic-bezier(0.32,0.72,0,1)',
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                        }}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
                      </svg>
                    </span>
                  </button>
                </dt>

                <dd
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  style={{
                    overflow: 'hidden',
                    maxHeight: isOpen ? 500 : 0,
                    transition: 'max-height 0.28s cubic-bezier(0.32,0.72,0,1)',
                  }}
                >
                  <p
                    style={{
                      padding: '0 28px 22px',
                      fontSize: 14,
                      color: '#5a5a5a',
                      lineHeight: 1.72,
                      margin: 0,
                    }}
                  >
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
