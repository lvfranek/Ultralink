export function NoCloaking() {
  return (
    <section
      className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden"
      aria-labelledby="no-cloaking-heading"
    >
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-surface" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(201,168,106,0.04)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: visual / badge */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              {/* Main card */}
              <div className="bg-bg border border-border-strong rounded-[var(--radius-lg)] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                {/* Honesty badge */}
                <div className="flex items-center gap-3 mb-6 p-4 rounded-[var(--radius)] bg-emerald-950/30 border border-emerald-800/30">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Platform-safe</p>
                    <p className="text-xs text-text-muted mt-0.5">Honest redirects. No crawler deception.</p>
                  </div>
                </div>

                {/* Comparison */}
                <div className="space-y-3">
                  {/* Bad: cloaking */}
                  <div className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] bg-red-950/20 border border-red-800/20">
                    <span className="text-red-400 mt-0.5 text-sm flex-shrink-0">✗</span>
                    <div>
                      <p className="text-xs font-medium text-red-400">Link cloaking</p>
                      <p className="text-xs text-text-subtle mt-0.5">Shows Instagram/TikTok one URL, sends users to another. Violates ToS → permanent ban.</p>
                    </div>
                  </div>
                  {/* Good: ultralink */}
                  <div className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] bg-emerald-950/20 border border-emerald-800/20">
                    <span className="text-emerald-400 mt-0.5 text-sm flex-shrink-0">✓</span>
                    <div>
                      <p className="text-xs font-medium text-emerald-400">Ultralink honest redirects</p>
                      <p className="text-xs text-text-subtle mt-0.5">Crawlers and users always see the same destination. Your account stays alive.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-[var(--radius-sm)] bg-emerald-950/20 border border-emerald-800/20">
                    <span className="text-emerald-400 mt-0.5 text-sm flex-shrink-0">✓</span>
                    <div>
                      <p className="text-xs font-medium text-emerald-400">Compliant 18+ age gate</p>
                      <p className="text-xs text-text-subtle mt-0.5">Age-restrict content the right way — no ToS violations, no account risk.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: copy */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-emerald-800/30 bg-emerald-950/20 text-xs font-medium tracking-widest uppercase text-emerald-400">
              Our commitment
            </div>
            <h2
              id="no-cloaking-heading"
              className="font-display text-4xl sm:text-5xl font-bold text-text mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              We don&apos;t cloak
              <br />
              your links.
              <br />
              <span className="text-text-muted font-normal">Ever.</span>
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>
                Link cloaking — serving Instagram and TikTok&apos;s crawlers one URL while sending your real visitors to a different destination — is a direct violation of every major social platform&apos;s terms of service.
              </p>
              <p>
                When it&apos;s detected (and it is detected), the result is a permanent, unappealable ban of your account. Not just the link. Your entire account — taking your following, your posts, and your business down with it.
              </p>
              <p className="text-text font-medium">
                Ultralink is built differently. Our redirects are completely honest: crawlers and users always see the same destination. No deception, no risk.
              </p>
              <p>
                Need to gate adult content? We give you a proper 18+ verification screen that&apos;s compliant and above-board. Need to control who sees your page? Use our geo-blocking. Everything we build keeps your accounts safe — by doing it the right way.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-800/30 text-emerald-400 flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <p className="text-sm text-text-muted">
                This is a permanent product principle, not a feature. We will{" "}
                <span className="text-text font-medium">never</span> add cloaking,
                regardless of demand.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
