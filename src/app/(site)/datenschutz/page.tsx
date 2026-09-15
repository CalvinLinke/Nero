import type { Metadata } from "next";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Datenschutz — NERO Familienbesitz GmbH",
  description: "Datenschutzerklärung der Nero Familienbesitz GmbH, Dresden.",
  robots: "noindex, follow",
};

type Section = {
  title: string;
  paragraphs: string[];
};

const sections: Section[] = [
  {
    title: "1. Verantwortlicher",
    paragraphs: [
      "Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist die Nero Familienbesitz GmbH, Pfotenhauerstraße 45, 01307 Dresden, vertreten durch den Geschäftsführer Jörg Hermann. Telefon: 0351 41899546, E-Mail: hallo@nero-familienbesitz.de.",
      "Ein Datenschutzbeauftragter ist nicht bestellt, da die gesetzlichen Voraussetzungen hierfür nicht vorliegen.",
    ],
  },
  {
    title: "2. Allgemeines zur Datenverarbeitung",
    paragraphs: [
      "Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte erforderlich ist oder Sie uns diese Daten selbst übermitteln, etwa über das Kontaktformular.",
      "Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b DSGVO (Vertrag oder vorvertragliche Maßnahmen), Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) und, soweit eine Einwilligung vorliegt, Art. 6 Abs. 1 lit. a DSGVO.",
    ],
  },
  {
    title: "3. Hosting und Server-Logdateien",
    paragraphs: [
      "Diese Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, gehostet. Beim Aufruf der Website verarbeitet Vercel automatisch technische Daten: IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite, übertragene Datenmenge, Browsertyp und Betriebssystem sowie die zuvor besuchte Seite.",
      "Die Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses an einer sicheren und stabilen Bereitstellung der Website (Art. 6 Abs. 1 lit. f DSGVO). Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung. Eine Übermittlung in die USA stützt sich auf die EU-Standardvertragsklauseln und die Zertifizierung von Vercel unter dem EU-US Data Privacy Framework. Logdaten werden nach kurzer Zeit gelöscht.",
    ],
  },
  {
    title: "4. Kontaktformular und E-Mail-Kontakt",
    paragraphs: [
      "Wenn Sie uns über das Kontaktformular schreiben, verarbeiten wir die dort eingegebenen Daten: Name, Firma, Kontaktart, E-Mail-Adresse, Telefonnummer und Ihre Nachricht. Die Verarbeitung dient der Bearbeitung Ihrer Anfrage und der weiteren Kommunikation mit Ihnen.",
      "Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf einen Vertragsschluss zielt, im Übrigen unser berechtigtes Interesse an der Beantwortung von Anfragen (Art. 6 Abs. 1 lit. f DSGVO).",
      "Für den Versand der Formulareingaben an unser Postfach nutzen wir den Dienst Resend (Resend, Inc., 2261 Market Street #5039, San Francisco, CA 94114, USA). Die Verarbeitung erfolgt in einem Rechenzentrum innerhalb der Europäischen Union. Mit Resend besteht ein Vertrag zur Auftragsverarbeitung.",
      "Zur Bearbeitung Ihrer Anfrage speichern wir Ihre Angaben zusätzlich in unserem Kundenverwaltungssystem Propstack (Propstack GmbH, Deutschland). Dort wird ein Kontakt mit einer Aufgabe zur Bearbeitung angelegt. Mit Propstack besteht ein Vertrag zur Auftragsverarbeitung.",
      "Ihre Daten werden gelöscht, sobald sie für die Bearbeitung Ihrer Anfrage nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Kommt es zu einem Vertragsverhältnis, gelten die handels- und steuerrechtlichen Aufbewahrungsfristen.",
    ],
  },
  {
    title: "5. Cookies, Analyse und Schriftarten",
    paragraphs: [
      "Diese Website setzt keine Cookies zu Analyse- oder Werbezwecken ein und nutzt keine Tracking- oder Analysedienste.",
      "Die verwendeten Schriftarten werden lokal von unserem Server ausgeliefert. Beim Aufruf der Website wird keine Verbindung zu Servern von Google oder anderen Schriftanbietern aufgebaut.",
    ],
  },
  {
    title: "6. Ihre Rechte",
    paragraphs: [
      "Sie haben das Recht auf Auskunft über die zu Ihrer Person gespeicherten Daten (Art. 15 DSGVO), auf Berichtigung (Art. 16 DSGVO), auf Löschung (Art. 17 DSGVO), auf Einschränkung der Verarbeitung (Art. 18 DSGVO) und auf Datenübertragbarkeit (Art. 20 DSGVO).",
      "Soweit wir Daten auf Grundlage eines berechtigten Interesses verarbeiten, können Sie der Verarbeitung aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen (Art. 21 DSGVO). Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen.",
      "Zur Ausübung Ihrer Rechte genügt eine Nachricht an hallo@nero-familienbesitz.de.",
    ],
  },
  {
    title: "7. Beschwerderecht bei einer Aufsichtsbehörde",
    paragraphs: [
      "Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren. Für uns zuständig ist die Sächsische Datenschutz- und Transparenzbeauftragte, Devrientstraße 5, 01067 Dresden, www.datenschutz.sachsen.de.",
    ],
  },
  {
    title: "8. Datensicherheit",
    paragraphs: [
      "Die Übertragung von Daten auf dieser Website erfolgt verschlüsselt über HTTPS. Wir treffen technische und organisatorische Maßnahmen, um Ihre Daten gegen Verlust, Manipulation und unbefugten Zugriff zu schützen.",
    ],
  },
  {
    title: "9. Änderungen dieser Datenschutzerklärung",
    paragraphs: [
      "Wir passen diese Datenschutzerklärung an, wenn sich die Rechtslage oder unsere Datenverarbeitung ändert. Es gilt die jeweils auf dieser Seite veröffentlichte Fassung.",
      "Stand: September 2026",
    ],
  },
];

export default function DatenschutzPage() {
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
              Datenschutz
            </h1>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-nero-offwhite py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl space-y-14">
            {sections.map((section) => (
              <AnimatedSection key={section.title}>
                <h2 className="font-display text-2xl text-nero-anthrazit leading-snug mb-5">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.paragraphs.map((text) => (
                    <p key={text} className="text-nero-anthrazit/70 font-light leading-relaxed">
                      {text}
                    </p>
                  ))}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
