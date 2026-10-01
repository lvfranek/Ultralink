"use client";

import { Plus } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { cx, delay } from "./shared";
import s from "./landing.module.css";

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  [
    "What is Ultralink?",
    "A link-in-bio platform. You build one fast page with every link that matters, then put that single URL in your Instagram, TikTok or X bio.",
  ],
  [
    "Is the free plan really free?",
    "Yes. No credit card, no trial period, no automatic upgrade. Upgrade to Pro only when you want analytics and the advanced tools.",
  ],
  [
    "What is deep linking?",
    "Social apps open links in their own in-app browser, where fans are logged out and checkout breaks. Ultralink sends them to Safari or Chrome instead.",
  ],
  [
    "What is Win-Back?",
    "When a visitor is about to leave your page, Win-Back shows a clean prompt with an alternative link — recovering traffic that would otherwise be lost.",
  ],
  [
    "Can my team manage our pages?",
    "Yes. Invite assistants or managers on Pro. They can edit pages and links without ever seeing your billing or account settings.",
  ],
  [
    "How do I cancel?",
    "Any time from your account settings. You keep access until the end of your billing period — no fees, no emails to support.",
  ],
] as const;

export function Faq() {
  return (
    <section id="faq" className={cx(s.section, s.faqSection)} aria-labelledby="faq-title">
      <div className={s.faqHead}>
        <p className={s.eyebrow} data-reveal>
          FAQ
        </p>
        <h2 id="faq-title" className={s.h2} data-reveal style={delay(80)}>
          Questions?
          <br />
          <em className={s.serifAccent}>Answered.</em>
        </h2>
        <p className={s.faqContact} data-reveal style={delay(160)}>
          Still unsure? <a href={`mailto:${siteConfig.supportEmail}`}>Talk to us.</a>
        </p>
      </div>
      <div className={s.faqList}>
        {FAQS.map(([q, a], i) => (
          <details key={q} className={s.faqItem} data-reveal style={delay(i * 60)}>
            <summary>
              {q}
              <Plus size={18} aria-hidden="true" className={s.faqIcon} />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
