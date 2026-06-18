import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import path from "path";

const logoPath = path.join(process.cwd(), "public", "Logo3.svg");

const styles = StyleSheet.create({
  // ── Cover ──
  coverPage: {
    backgroundColor: "#606060",
    padding: 60,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  coverTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  coverCompanyName: {
    fontSize: 9,
    color: "#FFFFFF",
    letterSpacing: 4,
    fontFamily: "Helvetica-Bold",
  },
  coverTopDivider: {
    width: 24,
    height: 1,
    backgroundColor: "#C4A35A",
  },
  coverCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  coverLogo: {
    width: 220,
    height: 110,
  },
  coverBottom: {
    flexDirection: "column",
  },
  coverTitle: {
    fontSize: 36,
    color: "#C4A35A",
    fontFamily: "Helvetica",
    marginBottom: 10,
    lineHeight: 1.2,
  },
  coverTagline: {
    fontSize: 9,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 2,
    fontFamily: "Helvetica",
    marginBottom: 24,
  },
  coverConfidential: {
    fontSize: 9,
    color: "rgba(255,255,255,0.25)",
    fontFamily: "Helvetica",
    letterSpacing: 1,
  },

  // ── Content page ──
  contentPage: {
    backgroundColor: "#F5F2ED",
    padding: 60,
    flexDirection: "column",
  },
  contentHeader: {
    fontSize: 9,
    color: "#C4A35A",
    letterSpacing: 3,
    fontFamily: "Helvetica-Bold",
    marginBottom: 36,
  },
  contentSections: {
    flex: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#C4A35A",
    marginBottom: 12,
    opacity: 0.3,
  },
  sectionTitle: {
    fontSize: 13,
    color: "#606060",
    fontFamily: "Helvetica-Bold",
    marginBottom: 7,
    letterSpacing: 0.3,
  },
  sectionText: {
    fontSize: 10,
    color: "rgba(96,96,96,0.7)",
    fontFamily: "Helvetica",
    lineHeight: 1.7,
  },
  placeholder: {
    fontSize: 10,
    color: "#C4A35A",
    fontFamily: "Helvetica",
    fontStyle: "italic",
  },

  // ── Contact footer (bottom of page 2) ──
  contactFooter: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(96,96,96,0.15)",
    borderTopStyle: "solid",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactFooterItem: {
    fontSize: 9,
    color: "rgba(96,96,96,0.5)",
    fontFamily: "Helvetica",
  },
  contactFooterWebsite: {
    fontSize: 9,
    color: "#C4A35A",
    fontFamily: "Helvetica",
  },
});

export default function AnnkaufsprofilPDF() {
  return (
    <Document title="NERO Ankaufsprofil" author="NERO Familienbesitz GmbH">
      {/* Page 1 — Cover */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverTopRow}>
          <Text style={styles.coverCompanyName}>NERO FAMILIENBESITZ</Text>
          <View style={styles.coverTopDivider} />
        </View>

        <View style={styles.coverCenter}>
          <Image src={logoPath} style={styles.coverLogo} />
        </View>

        <View style={styles.coverBottom}>
          <Text style={styles.coverTitle}>Ankaufsprofil</Text>
          <Text style={styles.coverTagline}>BESTANDSIMMOBILIEN · ELBTAL UM DRESDEN · LEIPZIG</Text>
          <Text style={styles.coverConfidential}>VERTRAULICH · {new Date().getFullYear()}</Text>
        </View>
      </Page>

      {/* Page 2 — Content + Contact Footer */}
      <Page size="A4" style={styles.contentPage}>
        <Text style={styles.contentHeader}>ANKAUFSPROFIL</Text>

        <View style={styles.contentSections}>
          <View style={styles.section}>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Region & Marktfokus</Text>
            <Text style={styles.sectionText}>
              Unser Investmentfokus liegt auf zwei Regionen: dem Elbtal um Dresden sowie der Metropolregion Leipzig. Beide Märkte kennen wir aus langjähriger Präsenz — nicht aus Datenanalysen, sondern aus Erfahrung. Regionale Verwurzelung ist für uns keine Marketingaussage, sondern Grundlage jeder Entscheidung.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Assetklassen & Strategie</Text>
            <Text style={styles.sectionText}>
              Wir kaufen Bestandsimmobilien — fertiggestellt, verwaltet, mit Geschichte. Unser Fokus liegt auf Wohnimmobilien im Bestand. Darüber hinaus erwerben wir ausgewählte Erbanteile und beteiligen uns selektiv an geeigneten Vorhaben. Kein Neubau, keine Projektentwicklung, keine Spekulation.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Ankaufskriterien</Text>
            <Text style={styles.sectionText}>
              Unsere Kriterien: alle Lagen im Elbtal um Dresden oder in Leipzig, Substanz im Objekt, Wohnungssanierung und Leerstände möglich. Komplexe Eigentümerverhältnisse und freie Notarwahl — möglich.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>Ticketgröße</Text>
            <Text style={styles.sectionText}>
              Ab 1 Wohneinheit, mindestens 30 m²{"\n"}
              Pakete von Wohnungen: Einheiten ab 30 m², Gesamtfläche Portfolio ab 50 m²{"\n"}
              Teileigentum mit Umwidmungsfähigkeit auf Wohnen{"\n"}
              MFH mit max. 10 % Gewerbeanteil — WEG-geteilt bevorzugt{"\n"}
              Erbanteile: individuell
            </Text>
          </View>
        </View>

        {/* Contact Footer */}
        <View style={styles.contactFooter}>
          <Text style={styles.contactFooterItem}>hallo@nero-familienbesitz.de</Text>
          <Text style={styles.contactFooterItem}>0351 41899546</Text>
          <Text style={styles.contactFooterItem}>Pfotenhauerstraße 45, 01307 Dresden</Text>
          <Text style={styles.contactFooterWebsite}>nero-familienbesitz.de</Text>
        </View>
      </Page>
    </Document>
  );
}
