import type { Metadata } from "next";
import { serifDisplay } from "@/components/marketing/landing/fonts";
import { Landing } from "@/components/marketing/landing/landing";

// Title/description/openGraph are already the root layout's defaults —
// only add what's specific to this page (its canonical URL), so this page
// still inherits the root's og:image instead of shadowing it with an
// openGraph object that omits `images`.
export const metadata: Metadata = {
  // absolute: the slogan replaces the " | ULTRALINK" template — it's the headline Google shows
  title: { absolute: "ULTRALINK – The link in bio that converts" },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    // No overflow clipping here — it would break the sticky "How it works" story
    <div className={serifDisplay.variable}>
      {/* Invisible until focused with Tab — lets keyboard users jump past the menu */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to main content
      </a>
      <Landing />
    </div>
  );
}
