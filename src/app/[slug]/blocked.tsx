export function BlockedPage() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-6"
      style={{ background: "#0E0E0E" }}
    >
      <div
        className="w-full max-w-sm rounded-[20px] p-8 text-center"
        style={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,.08)" }}
      >
        {/* Globe icon (inline SVG — no client import needed) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-5 w-8 h-8"
          style={{ color: "#4A4A4A" }}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>

        <h1 className="text-base font-semibold mb-2" style={{ color: "#ffffff" }}>
          This page isn&apos;t available in your region.
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "#6B6B6B" }}>
          The creator has chosen not to make this content available here.
        </p>
      </div>

      <p className="mt-6 text-xs" style={{ color: "#3A3A3A" }}>
        Powered by Ultralink
      </p>
    </div>
  );
}
