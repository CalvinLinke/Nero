import type { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
export const metadata: Metadata = {
  title: "Immobilien & Investments — NERO Familienbesitz GmbH",
  description:
    "Bestandsimmobilien in Leipzig und Dresden. NERO kauft Wohnimmobilien, Beteiligungen und Erbanteile — langfristig und diskret.",
};

const criteria = [
  {
    title: "Lage",
    text: "Leipzig und das Elbtal um Dresden. Märkte, die wir kennen — weil wir dort präsent sind und Entscheidungen aus Überzeugung treffen, nicht aus Datenlage.",
  },
  {
    title: "Assetklasse",
    text: "Wohnen im Bestand. Immobilien, die funktionieren — nicht solche, die es noch werden sollen. Kein Neubau, keine Projektentwicklung.",
  },
  {
    title: "Finanzierung",
    text: "Eigenkapital kombiniert mit klassischer Bankenbeteiligung. Kein Leverage-Exzess. Kaufentscheidungen, die wir mit eigenem Kapital verantworten.",
  },
];

export default function ImmobilienPage() {
  return (
    <>
      {/* ── Page Header ── */}
      <section className="bg-nero-anthrazit pt-44 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <p className="text-xs tracking-[0.2em] uppercase text-nero-gold mb-5 font-normal">
              Investmentstrategie
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-nero-offwhite leading-tight max-w-2xl">
              Was wir kaufen.<br />Und was nicht.
            </h1>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Bild ── */}
      <section className="w-full h-72 md:h-[480px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Bild1.png"
          alt="Bestandsimmobilien"
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </section>

      {/* ── Main Text ── */}
      <section className="bg-nero-offwhite py-36 md:py-48">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <AnimatedSection>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed text-lg mb-7">
                Unser Interesse gilt Bestandsimmobilien — fertiggestellt, verwaltet, mit Geschichte. Wohnimmobilien, Erbanteile, ausgewählte Beteiligungen. Keine Projekte auf der grünen Wiese, kein Neubau, keine Spekulation.
              </p>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed mb-7">
                Unsere Kriterien sind einfach: gute Lage in Leipzig oder im Elbtal um Dresden, Substanz im Objekt, klarer Eigentümer. Volumen und Ticketgröße kommunizieren wir nicht öffentlich — wer ein passendes Objekt hat, weiß es oder fragt uns direkt.
              </p>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed">
                Der Ankauf erfolgt aus Eigenkapital, ergänzt durch Bankenfinanzierung. Keine langen Entscheidungswege. Kein Bieterverfahren.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="mt-12 grid grid-cols-2 gap-5">
                <div className="border-l border-nero-gold/40 pl-6 py-1">
                  <p className="text-xs tracking-[0.15em] uppercase text-nero-gold/70 mb-1 font-normal">Assetklassen</p>
                  <p className="text-nero-anthrazit font-light">Wohnimmobilien · Erbanteile · Beteiligungen</p>
                </div>
                <div className="border-l border-nero-gold/40 pl-6 py-1">
                  <p className="text-xs tracking-[0.15em] uppercase text-nero-gold/70 mb-1 font-normal">Strategie</p>
                  <p className="text-nero-anthrazit font-light">Bestandsankauf, kein Neubau oder Projektentwicklung</p>
                </div>
                <div className="border-l border-nero-gold/40 pl-6 py-1">
                  <p className="text-xs tracking-[0.15em] uppercase text-nero-gold/70 mb-1 font-normal">Region</p>
                  <p className="text-nero-anthrazit font-light">Leipzig · Elbtal um Dresden</p>
                </div>
                <div className="border-l border-nero-gold/40 pl-6 py-1">
                  <p className="text-xs tracking-[0.15em] uppercase text-nero-gold/70 mb-1 font-normal">Finanzierung</p>
                  <p className="text-nero-anthrazit font-light">Eigenkapital + Bankenbeteiligung</p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.25}>
              <div className="mt-10 pt-8 border-t border-nero-anthrazit/10">
                <p className="text-xs tracking-[0.2em] uppercase text-nero-gold mb-3 font-normal">
                  Für Makler
                </p>
                <p className="text-nero-anthrazit/70 font-light leading-relaxed">
                  Für Makler mit konkretem Verkaufsauftrag: Wir entscheiden schnell. Kein Bieterverfahren, kein Komitee. Eine direkte Anfrage genügt — wir kommen mit einer Antwort zurück.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Criteria ── */}
      <section className="bg-nero-anthrazit py-36 md:py-48">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            kicker="Investitionsschwerpunkte"
            headline="Unsere Kriterien."
            light
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {criteria.map((c, i) => (
              <AnimatedSection key={c.title} delay={i * 0.12}>
                <div className="border-t border-white/15 pt-6 pl-5 relative group">
                  <div className="absolute left-0 top-0 w-[2px] h-0 bg-nero-gold group-hover:h-full transition-all duration-300" />
                  <h3 className="font-display text-xl text-nero-offwhite mb-3 group-hover:text-nero-gold transition-colors duration-200">
                    {c.title}
                  </h3>
                  <p className="text-sm text-white/45 font-light leading-relaxed">
                    {c.text}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ankaufsprofil Download ── */}
      <section className="bg-nero-offwhite py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="max-w-xl">
            <p className="text-xs tracking-[0.2em] uppercase text-nero-gold mb-5 font-normal">Ankaufsprofil</p>
            <h2 className="font-display text-3xl md:text-4xl text-nero-anthrazit leading-snug mb-6">
              Unsere Kriterien auf einen Blick.
            </h2>
            <p className="text-nero-anthrazit/55 font-light mb-10 leading-relaxed">
              Für Eigentümer und Makler: kompakte Übersicht unserer Ankaufsstrategie als PDF.
            </p>
            <a
              href="/api/ankaufsprofil"
              download="NERO_Ankaufsprofil.pdf"
              className="inline-block px-10 py-4 bg-nero-anthrazit text-nero-offwhite text-xs tracking-[0.18em] uppercase hover:bg-nero-gold transition-colors duration-300"
            >
              Ankaufsprofil herunterladen
            </a>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
