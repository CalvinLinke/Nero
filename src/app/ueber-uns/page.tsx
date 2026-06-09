import type { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";
import SectionHeading from "@/components/ui/SectionHeading";
export const metadata: Metadata = {
  title: "Über uns — NERO Familienbesitz GmbH",
  description:
    "Ein privates Family Office mit Fokus auf Bestandsimmobilien in Leipzig und Dresden. Langfristig, diskret, mit klaren Kriterien.",
};

const values = [
  {
    title: "Langfristigkeit",
    text: "Kein Quartalsziel, kein Exit-Druck. Unser Zeithorizont misst sich in Jahrzehnten. Was wir kaufen, kaufen wir mit der Absicht zu halten — nicht mit einer Exit-Strategie im Hinterkopf.",
  },
  {
    title: "Diskretion",
    text: "Was wir kaufen, kaufen wir ohne Aufsehen. Vertraulichkeit ist kein Marketingversprechen, sie ist Voraussetzung. Unsere Transaktionen sind privat. Das schützt alle Beteiligten.",
  },
  {
    title: "Konsequenz",
    text: "Wir haben klare Kriterien. Was nicht passt, kaufen wir nicht. Das klingt simpel — ist es aber selten in der Praxis. Und es spart Zeit. Auf beiden Seiten.",
  },
];

export default function UeberUnsPage() {
  return (
    <>
      {/* ── Page Header ── */}
      <section className="bg-nero-anthrazit pt-44 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <p className="text-xs tracking-[0.2em] uppercase text-nero-gold mb-5 font-normal">
              Family Office
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-nero-offwhite leading-tight max-w-2xl">
              Wie wir denken.<br />Was uns antreibt.
            </h1>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Bild ── */}
      <section className="w-full h-72 md:h-[480px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Bild3.png"
          alt="Klassische Fassade"
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
                Wir sind ein privates Family Office. Was wir tun, tun wir seit Jahren — ruhig, mit eigenem Kapital und ohne Abhängigkeit von Fremdinvestoren. Das erlaubt uns, langfristig zu denken. Nicht quartalsweise. Nicht auf Druck.
              </p>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed mb-7">
                Unser Fokus ist eng und bewusst gewählt: Wohnimmobilien in Metropolregionen, die wir kennen, weil wir dort investiert und gelernt haben. Leipzig. Das Elbtal um Dresden. Märkte mit Tiefe.
              </p>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed">
                Wir suchen keinen großen Auftritt. Wir suchen gute Objekte und verlässliche Partner — in dieser Reihenfolge.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="mt-12 pt-10 border-t border-nero-anthrazit/10">
                <p className="font-display text-xl md:text-2xl italic text-nero-anthrazit/55 leading-relaxed">
                  „Kein Exit-Druck. Keine Abhängigkeit. Nur Entscheidungen, die wir selbst verantworten."
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-nero-anthrazit py-36 md:py-48">
        <div className="max-w-6xl mx-auto px-6">
          <SectionHeading
            kicker="Haltung"
            headline="Was uns leitet."
            light
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {values.map((v, i) => (
              <AnimatedSection key={v.title} delay={i * 0.12}>
                <div className="border-t border-white/15 pt-6 pl-5 relative group">
                  <div className="absolute left-0 top-0 w-[2px] h-0 bg-nero-gold group-hover:h-full transition-all duration-300" />
                  <h3 className="font-display text-xl text-nero-offwhite mb-3 group-hover:text-nero-gold transition-colors duration-200">
                    {v.title}
                  </h3>
                  <p className="text-sm text-white/45 font-light leading-relaxed">
                    {v.text}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
