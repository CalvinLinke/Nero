import type { Metadata } from "next";
import { playfair, dmSans, dancingScript } from "@/lib/fonts";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "NERO Familienbesitz GmbH — Immobilien in Leipzig und Dresden",
  description:
    "NERO Familienbesitz ist ein privates Family Office mit Fokus auf Bestandsimmobilien in Leipzig und im Elbtal um Dresden. Langfristig. Diskret. Mit klaren Kriterien.",
  robots: "index, follow",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${playfair.variable} ${dmSans.variable} ${dancingScript.variable}`}>
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
