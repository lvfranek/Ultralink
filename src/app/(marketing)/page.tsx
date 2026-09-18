import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { TrafficRecovery } from "@/components/marketing/traffic-recovery";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { Footer } from "@/components/marketing/footer";
import { Header } from "@/components/marketing/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ultralink — One link. Your entire world.",
  description: "The premium link-in-bio for creators and agencies. Fast pages and real analytics.",
  openGraph: {
    title: "Ultralink — One link. Your entire world.",
    description: "The premium link-in-bio for creators and agencies. Fast pages and real analytics.",
    type: "website",
    url: "https://ultralink.bio",
  },
};

export default function HomePage() {
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100dvh", overflowX: "hidden", overflowY: "visible" }}>
      {/* Invisible until focused with Tab — lets keyboard users jump past the menu */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Features />
        <TrafficRecovery />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
