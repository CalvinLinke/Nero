/**
 * Erklärtexte für das (i) hinter jedem benannten Wert: Was ist das, woher kommt es,
 * und was hat es mit dem Kurs zu tun. Kurz, in Alltagssprache.
 */
export const ERKLAERUNG: Record<string, string> = {
  // Pegel
  spannung:
    "Wie anfällig der Markt gerade für eine große Bewegung ist, egal in welche Richtung. 0 bis 100, gerechnet aus sieben Signalen im Vergleich zu ihrer eigenen Historie der letzten 365 Tage. Über 75 heißt: Viele Zutaten für einen Ausschlag sind da. Termine wie Zinsentscheide erhöhen den Wert. Die Spannung sagt nicht, wohin es geht.",
  neigung:
    "In welche Richtung Positionierung und Geldflüsse gerade tendieren, in fünf Stufen von stark bärisch bis stark bullisch. Gerechnet aus vier Signalen. Richtung ist auf Tagessicht schlecht vorhersagbar, deshalb bewusst grob. Nur zusammen mit hoher Spannung interessant.",

  // Spannungssignale
  rv: "Realisierte Volatilität: wie stark der Kurs in den letzten 7 und 30 Tagen tatsächlich geschwankt hat, aus den Tagesschlusskursen von Kraken. Sehr ruhige Phasen mit engen Bändern gingen historisch kräftigen Ausbrüchen voraus, in etwa 60 Prozent der Fälle nach oben. Hoher Wert heißt: ungewöhnliche Ruhe oder abrupte Beruhigung.",
  term: "Laufzeitstruktur der Optionen bei Deribit: die eingepreiste Schwankung für 7 Tage geteilt durch die für 30 Tage. Normal liegt die kurze Frist darunter. Liegt sie darüber, ist die Struktur invertiert: Der Optionsmarkt erwartet akuten Stress. Solche Phasen halten im Schnitt nur wenige Tage.",
  vrp: "Volatilitätsprämie: DVOL (Deribits Erwartungsindex für die Schwankung der nächsten 30 Tage) minus der tatsächlichen Schwankung der letzten 30 Tage. Normalerweise ist die Erwartung höher als die Realität. Ist sie niedriger, bewegt sich der Markt stärker als eingepreist: Stressregime. Sehr hohe Prämie bei ruhigem Kurs heißt: Absicherung ist teuer gefragt.",
  hebel: "Hebelquote: offenes Interesse aller OKX-Terminkontrakte geteilt durch die Marktkapitalisierung. Je mehr gehebeltes Geld relativ zum Markt im Spiel ist, desto leichter lösen Kursbewegungen Zwangsliquidationen aus, die sich selbst verstärken. Jede große Kaskade seit 2021 hatte vorher Rekordwerte.",
  funding: "Funding-Rate: die Gebühr, die bei Perpetual-Futures alle 8 Stunden zwischen Long- und Short-Seite fließt. Stark positiv heißt: Longs zahlen viel, der Markt ist einseitig long gehebelt. Stark negativ umgekehrt. Extreme über mehrere Termine gingen den Einbrüchen im Mai 2021 und Oktober 2025 voraus. Seit 2024 sind die Ausschläge strukturell kleiner, deshalb zählt der Rang gegen die eigene Historie.",
  skew: "Put-Skew: wie viel teurer Absicherungs-Puts (25 Delta, 30 Tage) gegenüber vergleichbaren Calls sind, aus der Deribit-Kette gerechnet. Hoher Put-Aufschlag heißt Angst und Absicherungsnachfrage. Negativer Skew heißt Sorglosigkeit, Calls sind gefragter. Beides markiert Extreme, an denen Bewegungen eher kippen.",
  basis: "Futures-Basis: um wie viel Prozent pro Jahr der Quartalsfuture über dem Kassakurs notiert, verglichen mit dem risikolosen US-Zins für 2 Jahre. Liegt die Basis unter dem Zins, lohnt das beliebte Zins-Differenz-Geschäft (Cash-and-Carry) nicht mehr, und seine Auflösung kann den Markt in beide Richtungen bewegen. Über 15 Prozent war historisch Überhitzung.",

  // Neigungssignale
  funding30: "Funding-Regime: das Mittel der Funding-Rate über 30 Tage und die Länge einer Negativserie. Wochenlang negatives Funding war seit 2018 sechsmal ein Bodenregime mit positiver Rendite auf 90 Tage (Auswertung K33). Wirkt auf Wochen, nicht auf Tage.",
  lpoc: "Positionsaufbau: Tag für Tag wird verglichen, ob Kurs und offenes Interesse gemeinsam steigen (neue Longs), der Kurs fällt bei steigendem Interesse (neue Shorts) und so weiter. Starke Long-Rampen über sieben Tage gingen Umkehrungen voraus. Starker Short-Aufbau ist der Rohstoff für einen Short-Squeeze nach oben.",
  etf: "ETF-Zuflüsse: das Geld, das netto in die US-Spot-ETFs fließt oder abfließt (Quelle SoSoValue). Zuflüsse bewegen den Kurs am selben und am nächsten Tag in dieselbe Richtung, etwa 0,5 Prozent je 100 Millionen Dollar. Einzeltage sind Rauschen, deshalb die Summe über fünf Handelstage.",
  liq: "Liquidations-Impuls: Zwangsverkäufe gehebelter Positionen bei OKX in den letzten 24 Stunden. Ein Rekordtag räumt den Hebel einer Seite ab und lädt kurzfristig den Gegenschub: Nach einem großen Long-Flush neigt der Markt ein bis drei Tage zur Erholung, nach einem Short-Squeeze zur Korrektur. Nur OKX, keine Marktsumme.",

  // Pegelkarte
  ma200: "200-Tage-Linie: der Durchschnittskurs der letzten 200 Tage. Liegt der Kurs darüber, gilt der übergeordnete Trend als aufwärts. Viele große Anleger und Algorithmen richten sich daran aus, deshalb wirkt die Linie oft als Unterstützung oder Widerstand.",
  spanne7d: "7-Tage-Spanne: tiefster und höchster Kurs der letzten sieben Tage. Zeigt, wie breit der aktuelle Korridor ist und wo der Kurs innerhalb davon steht.",
  chg30d: "Veränderung des Kurses gegenüber dem Stand vor 30 Tagen. Ordnet die Tages- und Wochenbewegung in den Monatstrend ein.",

  // Optionsmarkt
  verfall: "Nächster Verfallstermin der Optionen bei Deribit, immer 08:00 UTC (10:00 Uhr deutscher Zeit). Zum Verfall werden offene Optionen abgerechnet. Rund um große Verfälle steigt die Schwankung oft, weil Absicherungen aufgelöst oder neu aufgebaut werden.",
  maxpain: "Max Pain: der Abrechnungskurs, bei dem die Käufer aller offenen Optionen zusammen am wenigsten bekämen. Eine verbreitete These sagt, der Kurs werde zum Verfall dorthin gezogen. Für Krypto ist das nicht belegt, deshalb nur zur Information und nicht in den Pegeln.",
  waende: "Put-Wand und Call-Wand: die Ausübungspreise unter und über dem Kurs mit dem meisten offenen Interesse. Dort liegen viele Absicherungen und Wetten. Solche Niveaus wirken oft als Bremsen, weil Händler, die diese Optionen verkauft haben, dagegen absichern.",
  pcr: "Put/Call-Verhältnis nach offenem Interesse: offene Puts geteilt durch offene Calls. Über 1 heißt mehr Absicherung oder Wetten auf fallende Kurse. Als Stimmungsmaß nützlich, als Vorhersage schwach belegt.",
  atmiv: "ATM-IV: die vom Optionsmarkt eingepreiste jährliche Schwankung für Optionen am aktuellen Kurs. 50 Prozent heißt grob: In einem Jahr traut der Markt dem Kurs eine Bewegung von etwa der Hälfte zu. Höhere Werte für kurze Laufzeiten zeigen akute Nervosität.",
  offen: "Offenes Interesse in Dollar: der Wert aller noch nicht abgerechneten Optionen dieses Verfalls. Je größer, desto mehr Positionen werden zum Termin aufgelöst oder gerollt.",

  // Positionierung
  oi: "Offenes Interesse der Perpetual-Futures je Börse: der Dollarwert aller offenen gehebelten Positionen. Steigt es bei flachem Kurs, bauen Händler einseitig Positionen auf. Bricht es ein, wurden Positionen zwangsweise geschlossen.",
  fundingBoersen: "Funding je Börse: dieselbe Gebühr wie im Signal, hier getrennt für OKX, Bybit und Deribit. Weichen die Börsen stark voneinander ab, ist die Positionierung ungleich verteilt.",
  ls: "Long/Short-Konten bei OKX: Zahl der Konten mit Long-Position geteilt durch die mit Short-Position. Über 1 heißt, mehr Kleinanleger sind long. Als Kontraindikator beliebt, wissenschaftlich schwach belegt, deshalb nur Kontext.",
  bybitLong: "Anteil der Bybit-Konten, die netto long stehen. Zweite Sicht auf dieselbe Frage wie das OKX-Verhältnis.",
  taker: "Taker-Käufe zu Taker-Verkäufen bei OKX: Volumen, das zu Marktpreisen gekauft wurde, geteilt durch das, was zu Marktpreisen verkauft wurde. Über 1 heißt aggressive Käufer, unter 1 aggressive Verkäufer.",
  liq24: "Liquidationen: Zwangsverkäufe gehebelter Positionen bei OKX in den letzten 24 Stunden, getrennt nach Longs und Shorts. Ein hoher Long-Anteil bedeutet, dass ein Kursrutsch gehebelte Käufer erwischt hat. Nur OKX, keine Summe über alle Börsen.",
  basisKachel: "Basis des Quartalsfutures bei OKX in Prozent pro Jahr. Zeigt, wie viel Aufschlag Händler für Kauf auf Termin zahlen. Hoch heißt Gier und teurer Hebel, negativ heißt Angst.",

  // ETF
  etfTag: "Netto-Zufluss aller US-Spot-ETFs am letzten Handelstag (Quelle SoSoValue, nach US-Börsenschluss). Zuflüsse kaufen echte Coins am Markt und stützen den Kurs am selben und am nächsten Tag.",
  etf5d: "Summe der Netto-Zuflüsse über die letzten fünf Handelstage. Glättet das Tagesrauschen. Extreme in beide Richtungen tragen ein Richtungssignal.",
  etf30d: "Summe der Netto-Zuflüsse über rund einen Monat. Zeigt den Trend der institutionellen Nachfrage.",
  etfAum: "Verwaltetes Vermögen aller US-Spot-ETFs. Ordnet die Zuflüsse ein: 300 Millionen sind bei 100 Milliarden Vermögen 0,3 Prozent.",
  etfVerlauf: "Tägliche Netto-Zuflüsse der letzten 30 Handelstage. Grün Zufluss, rot Abfluss.",

  // Makro
  zins2: "Rendite der 2-jährigen US-Staatsanleihe (Quelle FRED). Spiegelt die erwartete Zinspolitik der Fed. Steigende Zinsen machen risikolose Anlagen attraktiver und belasten Krypto tendenziell. Dient außerdem als Vergleich für die Futures-Basis.",
  zins10: "Rendite der 10-jährigen US-Staatsanleihe und der effektive Leitzins. Langfristzins und Leitzins zusammen zeigen, wie locker oder eng die Geldpolitik gerade ist.",
  dollar: "Breiter Dollar-Index der Fed (Handelsgewichtet, etwa eine Woche verzögert). Ein starker Dollar ging großen Krypto-Einbrüchen oft voraus, die Beziehung ist aber nicht stabil, deshalb nur Kontext.",
  fx: "EUR/USD und USD/JPY, EZB-Referenzkurse. EUR/USD rechnet alle Dollarwerte in Euro um. USD/JPY zeigt den Yen-Carry-Trade: Wenn der Yen abrupt aufwertet (Kurs fällt), werden weltweit gehebelte Positionen abgebaut, wie im August 2024.",
  fng: "Fear & Greed Index von Alternative.me, 0 (extreme Angst) bis 100 (extreme Gier), aus Volatilität, Volumen, Social Media und Dominanz. Studien finden keinen Vorhersagewert, deshalb nicht in den Pegeln. Zeigt nur die Stimmung.",
  stable: "Umlaufmenge von USDT und USDC (Quelle DefiLlama). Stablecoins sind das Bargeld des Kryptomarkts: Wächst die Menge, steht Kaufkraft bereit. Vor dem FTX-Kollaps 2022 flossen Stablecoins zwei Wochen vorher ab.",
  fees: "Empfohlene Bitcoin-Transaktionsgebühr in Satoshi je Byte (mempool.space). Hohe Gebühren heißen volles Netz und viel Aktivität, oft in hektischen Marktphasen.",
  staked: "Menge an Ether, die im Staking gebunden ist (ultrasound.money). Gestakte Coins sind kurzfristig nicht verkaufbar, ein hoher Anteil verringert das frei handelbare Angebot.",

  // Blöcke
  optionsmarkt: "Deribit ist die größte Börse für Bitcoin- und Ether-Optionen. Optionen sind Wetten und Absicherungen auf bestimmte Kursniveaus zu bestimmten Terminen. Aus den offenen Positionen lässt sich ablesen, wo der Markt Schmerzgrenzen sieht, wie nervös er ist und wann große Abrechnungen anstehen.",
  positionierung: "Perpetual-Futures sind gehebelte Dauerkontrakte ohne Verfall, das meistgehandelte Krypto-Instrument. Offenes Interesse, Funding und Liquidationen zeigen, wie viel Hebel im Markt steckt und auf welcher Seite. Dieser Hebel ist der Mechanismus, der aus einer Nachricht eine Kaskade macht.",
  etfBlock: "US-Spot-ETFs (zum Beispiel IBIT von BlackRock) kaufen echte Coins für ihre Anleger. Ihre täglichen Zu- und Abflüsse sind die sichtbarste Spur institutioneller Nachfrage und wirken direkt auf den Kurs.",
  makro: "Zinsen, Dollar, Stimmung und Stablecoins bilden das Umfeld, in dem Krypto gehandelt wird. Keiner dieser Werte sagt den Kurs voraus, aber sie erklären, wie viel Liquidität und Risikobereitschaft gerade da ist.",

  // Termine
  termine: "Kalender der nächsten 14 Tage: US-Inflationsdaten, Arbeitsmarktbericht, Fed-Zinsentscheid (von Hand gepflegt) und Deribit-Verfälle mit offenem Volumen. An Makrotagen bewegt sich Bitcoin im Schnitt doppelt so stark wie sonst. Termine binnen 24 Stunden erhöhen den Spannungspegel.",
  verlauf: "Verlauf des Spannungspegels (Fläche) gegen den Kurs in Euro (gestrichelt) über 90 Tage. Damit lässt sich prüfen, ob hohe Spannung tatsächlich großen Bewegungen vorausging.",
};
