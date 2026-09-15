import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Krypto-Orakel",
  robots: { index: false, follow: false, nocache: true },
};

export default function OrakelLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-nero-offwhite text-nero-anthrazit">{children}</div>;
}
