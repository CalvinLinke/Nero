import type { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Impressum — NERO Familienbesitz GmbH",
  description: "Anbieterkennzeichnung der Nero Familienbesitz GmbH, Dresden.",
  robots: "noindex, follow",
};

const blocks = [
  {
    label: "Angaben gemäß § 5 DDG",
    lines: [
      "Nero Familienbesitz GmbH",
      "Pfotenhauerstraße 45",
      "01307 Dresden",
    ],
  },
  {
    label: "Vertreten durch",
    lines: ["Geschäftsführer: Jörg Hermann"],
  },
  {
    label: "Kontakt",
    lines: ["Telefon: 0351 41899546", "E-Mail: hallo@nero-familienbesitz.de"],
  },
  {
    label: "Registereintrag",
    lines: [
      "Eintragung im Handelsregister",
      "Registergericht: Amtsgericht Dresden",
      "Registernummer: HRB 35966",
    ],
  },
  {
    label: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
    lines: ["Jörg Hermann", "Pfotenhauerstraße 45", "01307 Dresden"],
  },
];

export default function ImpressumPage() {
  return (
    <>
      {/* ── Page Header ── */}
      <section className="bg-nero-anthrazit pt-44 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <p className="text-xs tracking-[0.2em] uppercase text-nero-gold mb-5 font-normal">
              Rechtliches
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-nero-offwhite leading-tight max-w-xl">
              Impressum
            </h1>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-nero-offwhite py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl space-y-12">
            {blocks.map((block) => (
              <AnimatedSection key={block.label}>
                <p className="text-xs tracking-[0.15em] uppercase text-nero-gold/70 mb-3 font-normal">
                  {block.label}
                </p>
                <div className="text-nero-anthrazit/70 font-light leading-relaxed">
                  {block.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </AnimatedSection>
            ))}

            <AnimatedSection>
              <p className="text-xs tracking-[0.15em] uppercase text-nero-gold/70 mb-3 font-normal">
                Streitbeilegung
              </p>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed">
                Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <p className="text-xs tracking-[0.15em] uppercase text-nero-gold/70 mb-3 font-normal">
                Haftung für Inhalte und Links
              </p>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed mb-4">
                Die Inhalte dieser Website wurden mit Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit
                und Aktualität übernehmen wir keine Gewähr. Als Diensteanbieter sind wir für eigene Inhalte
                nach den allgemeinen Gesetzen verantwortlich.
              </p>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed">
                Diese Website enthält gegebenenfalls Links zu externen Websites Dritter, auf deren Inhalte wir
                keinen Einfluss haben. Für diese Inhalte ist stets der jeweilige Anbieter verantwortlich.
                Bei Bekanntwerden von Rechtsverletzungen entfernen wir derartige Links umgehend.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <p className="text-xs tracking-[0.15em] uppercase text-nero-gold/70 mb-3 font-normal">
                Urheberrecht
              </p>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed">
                Texte, Bilder und Gestaltung dieser Website unterliegen dem deutschen Urheberrecht.
                Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des Urheberrechts
                bedürfen unserer schriftlichen Zustimmung.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
