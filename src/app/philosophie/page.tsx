import type { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Philosophie — NERO Familienbesitz GmbH",
  description:
    "Langfristigkeit, Kapitalerhalt, partnerschaftliches Denken. Die Investmentphilosophie von NERO Familienbesitz.",
};

export default function PhilosophiePage() {
  return (
    <>
      {/* ── Page Header ── */}
      <section className="bg-nero-anthrazit pt-44 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <p className="text-xs tracking-[0.2em] uppercase text-nero-gold mb-5 font-normal">
              Investmentphilosophie
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-nero-offwhite leading-tight max-w-xl">
              Wie wir investieren.<br />Warum.
            </h1>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Main Text ── */}
      <section className="bg-nero-offwhite py-36 md:py-48">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <AnimatedSection>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed text-lg mb-8">
                Langfristigkeit ist kein Versprechen. Es ist eine Konsequenz — aus der Art, wie wir unser Kapital einsetzen: in Objekte, die wir verstehen, in Regionen, die wir kennen, mit Partnern, denen wir vertrauen.
              </p>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed mb-8">
                Kapitalerhalt geht vor Wachstum. Das klingt defensiv, ist es aber nicht. Es bedeutet: Wir kaufen nicht, was billig ist. Wir kaufen, was gut ist. Und halten es. Der Unterschied ist klein in der Beschreibung und groß in der Wirkung.
              </p>
              <p className="text-nero-anthrazit/70 font-light leading-relaxed">
                Dealflow entsteht im Verbund — nicht durch Inserate oder Ausschreibungen. Durch Vertrauen, Netzwerk, Wiederholung. Wer einmal mit uns gearbeitet hat, weiß, wie wir Entscheidungen treffen. Und kommt wieder.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.15}>
              <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                {[
                  { label: "Zeithorizont", value: "Jahrzehnte" },
                  { label: "Priorität", value: "Kapitalerhalt" },
                  { label: "Dealflow", value: "Im Verbund" },
                  { label: "Entscheidungen", value: "Eigenverantwortlich" },
                ].map((item) => (
                  <div key={item.label} className="border-b border-nero-anthrazit/10 pb-6 pl-5 relative group">
                    <div className="absolute left-0 top-0 w-[2px] h-0 bg-nero-gold group-hover:h-full transition-all duration-300" />
                    <p className="text-xs tracking-[0.15em] uppercase text-nero-gold/70 mb-1 font-normal">{item.label}</p>
                    <p className="font-display text-xl text-nero-anthrazit group-hover:text-nero-gold transition-colors duration-200">{item.value}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Pull Quote ── */}
      <section className="bg-nero-offwhite py-36 md:py-48">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <AnimatedSection className="max-w-2xl mx-auto">
            <p className="font-handwriting text-4xl md:text-5xl lg:text-6xl text-nero-gold leading-snug">
              „Wir kaufen nicht, was billig ist. Wir kaufen, was gut ist."
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section className="bg-nero-offwhite py-36 md:py-48">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection className="mb-20">
            <p className="text-xs tracking-[0.2em] uppercase text-nero-gold mb-4 font-normal">
              Vier Säulen
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-nero-anthrazit">
              Was uns leitet.
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-14">
            {[
              {
                num: "01",
                title: "Langfristiger Investmentansatz",
                text: "Wir messen unsere Entscheidungen nicht in Quartalen. Ein Objekt, das wir kaufen, bleibt. Das verändert, welche Objekte wir kaufen — und welche nicht.",
              },
              {
                num: "02",
                title: "Kapitalerhalt vor Wachstum",
                text: "Rendite ist eine Konsequenz guter Entscheidungen — kein Ziel an sich. Wer den Erhalt ernst nimmt, kauft anders. Vorsichtiger. Präziser.",
              },
              {
                num: "03",
                title: "Partnerschaftliches Denken",
                text: "Transaktionen entstehen aus Beziehungen. Wir denken nicht in Einzeldeals, sondern in Netzwerken. Was heute nicht passt, kann morgen relevant werden.",
              },
              {
                num: "04",
                title: "Verantwortung & Bestand",
                text: "Bestandsimmobilien tragen Verantwortung — für Mieter, für Nachbarschaft, für Substanz. Das nehmen wir ernst. Nicht als Pflicht. Als Teil des Geschäftsmodells.",
              },
            ].map((pillar, i) => (
              <AnimatedSection key={pillar.num} delay={i * 0.1}>
                <div className="border-t border-nero-anthrazit/10 pt-6 pl-5 relative group">
                  <div className="absolute left-0 top-0 w-[2px] h-0 bg-nero-gold group-hover:h-full transition-all duration-300" />
                  <div className="flex gap-7">
                    <span className="font-display text-3xl text-nero-gold/30 group-hover:text-nero-gold/60 flex-shrink-0 leading-none mt-1 transition-colors duration-200">
                      {pillar.num}
                    </span>
                    <div>
                      <h3 className="font-display text-xl text-nero-anthrazit mb-3 group-hover:text-nero-gold transition-colors duration-200">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-nero-anthrazit/55 font-light leading-relaxed">
                        {pillar.text}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
