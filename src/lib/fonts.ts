import { Playfair_Display, DM_Sans, Dancing_Script } from "next/font/google";

export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dancing",
  display: "swap",
});
