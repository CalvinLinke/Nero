import type { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ContactForm from "@/components/ui/ContactForm";

export const metadata: Metadata = {
  title: "Kontakt — NERO Familienbesitz GmbH",
  description:
    "Kontaktieren Sie NERO Familienbesitz. Kein Bieterverfahren, kein langer Prozess — direkte Anfrage für qualifizierte Objekte.",
};

export default function KontaktPage() {
  return (
    <>
      {/* ── Page Header ── */}
      <section className="bg-nero-anthrazit pt-44 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <p className="text-xs tracking-[0.2em] uppercase text-nero-gold mb-5 font-normal">
              Kontakt
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-nero-offwhite leading-tight">
              Sprechen wir.
            </h1>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Form + Info ── */}
      <section className="bg-nero-offwhite py-36 md:py-48">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-20 md:gap-28">
            {/* Left: Info */}
            <div className="md:col-span-4">
              <AnimatedSection>
                <p className="text-nero-anthrazit/65 font-light leading-relaxed mb-12">
                  Wir kaufen diskret. Keine Bieterverfahren, keine langen Prozesse. Wer ein Objekt hat, das zu unseren Kriterien passt, nimmt Kontakt auf. Der Rest ergibt sich schnell.
                </p>

                <div className="space-y-9">
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-nero-gold/70 mb-2 font-normal">
                      E-Mail
                    </p>
                    <p className="text-nero-anthrazit/55 font-light text-sm">
                      [Bitte eintragen]
                    </p>
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-nero-gold/70 mb-2 font-normal">
                      Telefon
                    </p>
                    <p className="text-nero-anthrazit/55 font-light text-sm">
                      [Bitte eintragen]
                    </p>
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-nero-gold/70 mb-2 font-normal">
                      Adresse
                    </p>
                    <p className="text-nero-anthrazit/55 font-light text-sm leading-relaxed">
                      NERO Familienbesitz GmbH<br />
                      [Straße, PLZ Stadt]
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            </div>

            {/* Right: Form */}
            <div className="md:col-span-8">
              <AnimatedSection delay={0.15}>
                <ContactForm />
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
