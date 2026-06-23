import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { TrafficRecovery } from "@/components/marketing/traffic-recovery";
import { NoCloaking } from "@/components/marketing/no-cloaking";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { Footer } from "@/components/marketing/footer";
import { Header } from "@/components/marketing/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ultralink — One link. Your entire world.",
  description:
    "The premium link-in-bio for creators and agencies. Fast pages, real analytics, no cloaking, no bans.",
  openGraph: {
    title: "Ultralink — One link. Your entire world.",
    description:
      "The premium link-in-bio for creators and agencies. Fast pages, real analytics, no cloaking, no bans.",
    type: "website",
    url: "https://ultralink.bio",
  },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <TrafficRecovery />
        <NoCloaking />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
