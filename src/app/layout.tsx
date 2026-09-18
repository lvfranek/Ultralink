import type { Metadata } from "next";
import {
  Geist,
  Inter,
  Playfair_Display,
  Poppins,
  Montserrat,
  Space_Grotesk,
  DM_Sans,
  Cormorant,
  Bebas_Neue,
} from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // Not preloaded, like the other theme fonts below: Inter is only used on
  // bio pages that pick it (the default), never on marketing/auth/legal
  // pages — preloading it there only slowed down their LCP for nothing.
  preload: false,
});

// Theme fonts below are only used on bio pages that pick them in the Design
// tab, so they aren't preloaded on every page. Geist (UI chrome, used
// everywhere) is the only font that stays preloaded.
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
  weight: ["400", "500", "600", "700", "800", "900"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: false,
});

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
  weight: ["400", "500", "600", "700"],
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
  preload: false,
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Ultralink",
    template: "%s | Ultralink",
  },
  description: "The premium link-in-bio platform for creators and agencies. Fast pages and real analytics.",
  metadataBase: new URL("https://ultralink.bio"),
  icons: {
    icon: "/favicon/favicon.png",
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  openGraph: {
    siteName: "Ultralink",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={[
        geist.variable,
        inter.variable,
        playfair.variable,
        poppins.variable,
        montserrat.variable,
        spaceGrotesk.variable,
        dmSans.variable,
        cormorant.variable,
        bebasNeue.variable,
        "h-full",
      ].join(" ")}
      style={{ background: "#0A0A0A" }}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased" style={{ background: "#0A0A0A" }}>
        {children}
      </body>
    </html>
  );
}
