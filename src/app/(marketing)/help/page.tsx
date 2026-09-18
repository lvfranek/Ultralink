import type { Metadata } from "next";
import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { HelpCenter } from "@/components/marketing/help-center";

export const metadata: Metadata = {
  // The root layout's title template already appends " | Ultralink"
  title: "Help Center",
  description: "Learn how to get the most out of Ultralink with short video walkthroughs.",
  alternates: { canonical: "/help" },
};

export default function HelpPage() {
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100dvh" }}>
      <Header />
      <main>
        <HelpCenter />
      </main>
      <Footer />
    </div>
  );
}
