# NERO Familienbesitz GmbH — Projektdokumentation

## Projektübersicht

**Typ:** Family Office Website — Immobilienfokus
**Firma:** NERO Familienbesitz GmbH
**Region:** Metropolregion Leipzig + Elbtal um Dresden
**Positionierung:** Diskreter Großbestandsankäufer. Kein Dienstleister, kein Makler, keine Projektentwicklung.
**Kernbotschaft:** Vertrauensfilter für qualifizierte Kontakte — kein Vertriebstool.

> Leitgedanke: „Wir überzeugen durch Haltung, nicht durch Lautstärke."

---

## Tech Stack

| Technologie | Version | Zweck |
|-------------|---------|-------|
| Next.js | 15 (App Router) | Framework |
| TypeScript | Latest | Sprache |
| Tailwind CSS | v4 | Styling |
| Framer Motion | Latest | Animationen |
| Resend | Latest | E-Mail (Kontaktformular) |
| next/font | Built-in | Google Fonts |

**Deployment:** Vercel
**Sprache:** Nur Deutsch

---

## Design-System

### Farbpalette (Tailwind-Tokens)

```js
// tailwind.config.ts
colors: {
  nero: {
    black: '#1C1C1C',      // Hero-Backgrounds, dunkle Sektionen
    anthrazit: '#2C2C2C',  // Navigation, Footer
    teal: '#2D6060',       // Akzent-Sektionen (max. 1× pro Seite)
    tealhell: '#3D7B7B',   // Hover-Teal
    gold: '#C4A35A',       // Dekorlinien, Hover-Akzent
    beige: '#E8E0D5',      // Subtile Trennflächen
    offwhite: '#F5F2ED',   // Helle Sektionen, Haupt-Hintergrund
  }
}
```

### Typografie

- **Display/Headline:** `Playfair Display` (Serif) — H1–H2, Italic für Zitate
- **Body/UI:** `DM Sans` (Sans-Serif) — 300 (Fließtext), 400 (Labels), 500 (CTA)
- **Navigation/Kicker:** DM Sans 400, `letter-spacing: 0.15em`, UPPERCASE

### Abstands-Prinzip

- Sektionsabstände: `py-32` (128px) Desktop / `py-20` (80px) Mobile
- Textbreite: max. `max-w-2xl` (720px)
- Layout-Breite: max. `max-w-6xl` (1200px)
- Whitespace ist Aussage — nie auf Vollbelegung optimieren

### Sektionsrhythmus

Abwechselnd — nie zweimal dasselbe direkt hintereinander:
1. `nero-black` (Hero)
2. `nero-offwhite` (hell)
3. `nero-teal` (Teal-Akzent, max. einmal pro Seite)
4. `nero-offwhite` (hell)
5. `nero-anthrazit` (Footer)

---

## Karten & Container-Philosophie

**Kein Box-Denken.** Keine Schatten, keine Border-Boxen, keine Backgrounds auf Cards.

Der Raum ist der Container. Karten entstehen durch Raster, Abstand und Typografie.

### Investment-Cards
- Oben: 1px Goldlinie (`border-t border-nero-gold`)
- Heading: Playfair Display 24px
- Body: DM Sans 300, 16px, `leading-relaxed`
- Hover: 2px Goldlinie links erscheint (`border-l-2 border-nero-gold`), `transition-all duration-200`
- Kein Scale, kein Shadow, keine Box

### Formular-Inputs
- Nur untere Linie: `border-b border-nero-anthrazit`
- Focus: `border-nero-gold` (200ms transition)
- Submit-Button: Filled Anthrazit → Teal on hover

---

## Das Berg-Motiv (Designsprache)

Die Bergsilhouette aus dem NERO-Logo ist das visuelle Markenzeichen der Website:
- **Hero:** Bergkette baut sich über volle Bildschirmbreite auf (staggered, von unten)
- **Sektionstrennlinien:** Dünne Bergkontur-SVG animiert beim Scroll (pathLength 0→1)
- **Mobile-Navigation:** Bergsilhouette als transparentes Hintergrundelement (5% opacity)

SVG-Assets: `src/assets/mountain-silhouette.svg`

---

## Navigations-Design

- Floating Navigation: transparent → nach 80px Scroll: `backdrop-blur-md` + `bg-nero-anthrazit/90`
- Logo links (40px Höhe)
- Links rechts: UPPERCASE + `letter-spacing: 0.15em`
- Punkte: `START · ÜBER UNS · IMMOBILIEN · PHILOSOPHIE · KONTAKT`
- Mobile: Vollscreen-Overlay mit Bergsilhouette im Hintergrund

---

## Seiten & Inhalte

### `/` — Startseite

**Hero:**
- Hintergrund: `nero-black` + feines Noise-Texture-Overlay
- Bergkette SVG, volle Breite, ~15% Opacity, staggered-Aufbau beim Laden
- Logo zentriert
- Headline: „Wir überzeugen durch Haltung, nicht durch Lautstärke."
- Subline: „Immobilien in Leipzig und im Elbtal um Dresden."
- Ghost-CTA: „Kontakt aufnehmen"

**Intro-Sektion:**
NERO Familienbesitz ist kein Dienstleister. Wir kaufen Immobilien in den Bestand — mit eigenem Kapital, ohne Zeitdruck. Unser Fokus liegt auf Bestandsobjekten in Leipzig und der Dresdner Region. Langfristig. Diskret. Mit klaren Kriterien.

**Investment-Cards (3 Stück):**
- Bestandsimmobilien — Wir kaufen, was steht — und halten es. Kein Exit-Druck, kein Quartalsziel. Unser Zeithorizont beginnt da, wo andere aufhören zu rechnen.
- Beteiligungen — Für Vorhaben, die mehr brauchen als Kapital. Wir beteiligen uns selektiv — und dann dauerhaft.
- Erbanteile — Eine Assetklasse, die Diskretion verlangt und Vertrauen belohnt. Wir kennen die Materie und nehmen uns die Zeit, die sie braucht.

**CTA:** Haben Sie ein Objekt, das passt? → „Kontakt aufnehmen"

---

### `/ueber-uns` — Über uns

**Headline:** Wie wir denken. Was uns antreibt.

Wir sind ein privates Family Office. Was wir tun, tun wir seit Jahren — ruhig, mit eigenem Kapital und ohne Abhängigkeit von Fremdinvestoren. Das erlaubt uns, langfristig zu denken. Nicht quartalsweise. Nicht auf Druck.

Unser Fokus ist eng und bewusst gewählt: Wohnimmobilien in Metropolregionen, die wir kennen, weil wir dort investiert und gelernt haben. Leipzig. Das Elbtal um Dresden. Märkte mit Tiefe.

Wir suchen keinen großen Auftritt. Wir suchen gute Objekte und verlässliche Partner — in dieser Reihenfolge.

**Werte (3 Absätze, kein Listing):**
- **Langfristigkeit** — Kein Quartalsziel, kein Exit-Druck. Unser Zeithorizont misst sich in Jahrzehnten.
- **Diskretion** — Was wir kaufen, kaufen wir ohne Aufsehen. Vertraulichkeit ist kein Marketingversprechen, sie ist Voraussetzung.
- **Konsequenz** — Wir haben klare Kriterien. Was nicht passt, kaufen wir nicht. Das spart Zeit — auf beiden Seiten.

---

### `/immobilien` — Immobilien & Investments

**Headline:** Was wir kaufen. Und was nicht.

Unser Interesse gilt Bestandsimmobilien — fertiggestellt, verwaltet, mit Geschichte. Wohnimmobilien, Erbanteile, ausgewählte Beteiligungen. Keine Projekte auf der grünen Wiese, kein Neubau, keine Spekulation.

Unsere Kriterien sind einfach: gute Lage in Leipzig oder im Elbtal um Dresden, Substanz im Objekt, klarer Eigentümer. Volumen und Ticketgröße kommunizieren wir nicht öffentlich — wer ein passendes Objekt hat, weiß es oder fragt uns direkt.

Der Ankauf erfolgt aus Eigenkapital, ergänzt durch Bankenfinanzierung. Keine langen Entscheidungswege. Kein Bieterverfahren.

**Investitionsschwerpunkte (Grid):**
- Lage — Leipzig und das Elbtal um Dresden. Märkte, die wir kennen, weil wir dort präsent sind.
- Assetklasse — Wohnen im Bestand. Immobilien, die funktionieren — nicht solche, die es noch werden sollen.
- Finanzierung — Eigenkapital kombiniert mit klassischer Bankenbeteiligung. Kein Leverage-Exzess.

---

### `/philosophie` — Philosophie

**Headline:** Wie wir investieren. Warum.

Langfristigkeit ist kein Versprechen. Es ist eine Konsequenz — aus der Art, wie wir unser Kapital einsetzen: in Objekte, die wir verstehen, in Regionen, die wir kennen, mit Partnern, denen wir vertrauen.

Kapitalerhalt geht vor Wachstum. Das klingt defensiv, ist es aber nicht. Es bedeutet: Wir kaufen nicht, was billig ist. Wir kaufen, was gut ist. Und halten es.

Dealflow entsteht im Verbund — nicht durch Inserate oder Ausschreibungen. Durch Vertrauen, Netzwerk, Wiederholung. Wer einmal mit uns gearbeitet hat, weiß, wie wir Entscheidungen treffen. Und kommt wieder.

**Pull-Quote:** „Wir kaufen nicht, was billig ist. Wir kaufen, was gut ist."

---

### `/kontakt` — Kontakt

**Headline:** Sprechen wir.

Wir kaufen diskret. Keine Bieterverfahren, keine langen Prozesse. Wer ein Objekt hat, das zu unseren Kriterien passt, nimmt Kontakt auf. Der Rest ergibt sich schnell.

**Formular:** Name · Unternehmen (optional) · E-Mail · Nachricht → „Anfrage senden"

**Kontaktdaten:** (Platzhalter — vor Go-Live einzutragen)
- E-Mail: [einzutragen]
- Telefon: [einzutragen]
- Adresse: [einzutragen]

---

## Schreibregeln & Tonalität

### Eigenschaften
- Seriös, klar, ruhig, zurückhaltend selbstbewusst
- Kurze, präzise Sätze für Kernaussagen
- Satzrhythmus variiert aktiv — nie zwei aufeinanderfolgende Sätze gleicher Länge
- Klare Perspektive mit erkennbarem Standpunkt

### VERBOTSLISTE — ohne Ausnahme

**Verbotene Wörter:**
zudem · darüber hinaus · letztendlich · im Wesentlichen · schlussendlich · grundsätzlich · vielfältig · umfassend · ganzheitlich · nahtlos · maßgeschneidert · bahnbrechend · revolutionär · einzigartig · nichtsdestotrotz · selbstverständlich · gleichermaßen · entsprechend · diesbezüglich

**Verbotene Eröffnungen:**
„In der heutigen Zeit…" · „Es ist wichtig zu beachten…" · „Als Eigentümer stehen Sie vor…" · „Der Immobilienmarkt befindet sich im Wandel…"

**Verbotene Strukturmuster:**
- Symmetrische 3-Punkte-Strukturen (Intro → 3 gleich lange Abschnitte → Fazit)
- Aufzählungen mit mehr als 5 Punkten ohne Fließtext-Überleitung
- Abschluss-Zusammenfassung, die nur das Vorherige wiederholt
- Mehr als zwei aufeinanderfolgende Sätze gleicher Länge
- Leere Superlative ohne Beleg

---

## Offene Punkte (vor Go-Live)

- Kontaktdaten eintragen: E-Mail, Telefon, Adresse
- `RESEND_API_KEY` in `.env.local` setzen
- `CONTACT_EMAIL` (Empfänger-Adresse) in `.env.local` setzen
