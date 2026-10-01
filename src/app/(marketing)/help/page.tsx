import type { Metadata } from "next";
import { serifDisplay } from "@/components/marketing/landing/fonts";
import { SiteShell } from "@/components/marketing/landing/shell";
import { HelpCenter } from "@/components/marketing/help-center";

export const metadata: Metadata = {
  // The root layout's title template already appends " | ULTRALINK"
  title: "Help Center",
  description: "Learn how to get the most out of Ultralink with short video walkthroughs.",
  alternates: { canonical: "/help" },
};

export default function HelpPage() {
  return (
    <div className={serifDisplay.variable}>
      {/* Invisible until focused with Tab — lets keyboard users jump past the menu */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to main content
      </a>
      <SiteShell>
        <main id="main">
          <HelpCenter />
        </main>
      </SiteShell>
    </div>
  );
}
