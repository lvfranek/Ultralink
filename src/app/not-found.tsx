import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// Renders for unmatched URLs and any notFound() call (e.g. a missing/paused
// bio page). Inherits the root layout, so fonts/background are already set.
export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center text-center px-6">
      <div className="mb-8">
        <Logo onDark />
      </div>
      <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: "#6B6B6B" }}>
        404
      </p>
      <h1 className="text-3xl font-bold mb-3" style={{ color: "#ffffff" }}>
        Page not found
      </h1>
      <p className="text-sm mb-8" style={{ color: "#9A9A9A" }}>
        This page doesn&apos;t exist, or it may have moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-85"
        style={{ background: "#ffffff", color: "#0A0A0A" }}
      >
        Back to home
      </Link>
    </div>
  );
}
