import { Instrument_Serif } from "next/font/google";

// Italic accent words in the marketing headlines ("converts.", "one tap away.")
export const serifDisplay = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif-display",
  display: "swap",
});
