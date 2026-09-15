# Krypto-Orakel: Betrieb und Einrichtung

Stand 15.09.2026. Das Orakel ist ein versteckter Bereich der NERO-Website für Jörg Hermann.
Es misst stündlich für Bitcoin und Ethereum zwei Pegel: **Spannung** (wie anfällig ist der Markt
für eine große Bewegung, 0 bis 100) und **Neigung** (in welche Richtung tendieren Positionierung
und Zuflüsse, bärisch bis bullisch). Fachliche Herleitung: siehe Abschnitt „Signale“.

## Aufbau

| Teil | Ort |
|---|---|
| Seite | `/orakel`, Zugang über `/orakel/zugang/<ORAKEL_TOKEN>` (setzt ein Cookie für ein Jahr) |
| Stündlicher Lauf | `/api/orakel/cron`, aufgerufen von Vercel Cron (`vercel.json`), geschützt durch `CRON_SECRET` |
| Datenquellen | `src/lib/orakel/sources/` (Kraken, CoinGecko, Frankfurter, Deribit, OKX, Bybit, SoSoValue, FRED, DefiLlama, Alternative.me, mempool.space, ultrasound.money) |
| Sammler | `src/lib/orakel/collect.ts` schreibt alle Messwerte als Zeitreihen |
| Signale und Pegel | `src/lib/orakel/signals.ts`, `src/lib/orakel/pegel.ts`, Optionsmathematik in `options.ts` |
| Kalender | `src/lib/orakel/data/kalender.json` (CPI, Arbeitsmarkt, FOMC; von Hand gepflegt) |
| Mails | `src/lib/orakel/notify.ts` über Resend |
| Datenbank | Postgres-Schema `orakel` (Neon in Produktion, PGlite lokal), Drizzle-Schema in `src/lib/orakel/db/schema.ts` |

Zeitplan (`vercel.json`, Pro-Plan nötig): jede volle Stunde, zusätzlich werktags 13:25 UTC (vor US-Börsenöffnung)
und freitags 07:30 UTC (vor dem Deribit-Verfall um 08:00 UTC). Alle Funktionen laufen in Frankfurt (`fra1`),
damit keine Börse wegen US-Adressen sperrt.

## Stand der Einrichtung

15.09.2026: Neon-Datenbank `nero-orakel` (Frankfurt, Free) angelegt und verbunden, Variablen gesetzt, erster
Produktionslauf `status: ok` ohne Quellenfehler, drei Crons in Vercel sichtbar, Dashboard live erreichbar.

## Einmalige Einrichtung auf Vercel (Calvin)

1. **Datenbank:** Im Vercel-Projekt unter Storage → Create Database → Neon (kostenloser Tarif) anlegen und mit dem
   Projekt verbinden. Vercel setzt dann `DATABASE_URL` automatisch. Alternativ eine eigene Neon-Datenbank und
   `ORAKEL_DATABASE_URL` setzen.
2. **Migration:** entfällt. Das Orakel wendet ausstehende Migrationen beim ersten Zugriff je Prozess selbst an
   (`src/lib/orakel/db/client.ts`). `npm run orakel:migrate` bleibt als manueller Weg erhalten.
3. **Umgebungsvariablen** im Vercel-Projekt setzen (Production):

   | Variable | Wert |
   |---|---|
   | `ORAKEL_TOKEN` | langer Zufallswert, bildet den geheimen Link (`/orakel/zugang/<Wert>`) |
   | `CRON_SECRET` | langer Zufallswert; Vercel sendet ihn bei jedem Cron-Aufruf mit |
   | `ORAKEL_MAIL_TO` | `joerg.hermann@nero-familienbesitz.de` |
   | `ORAKEL_MAIL_ADMIN` | Calvins Adresse für Störungsmeldungen |
   | `ORAKEL_MAIL_FROM` | `NERO Orakel <orakel@nero-familienbesitz.de>` (erst nach Domain-Verifizierung, siehe unten) |
   | `ORAKEL_PUBLIC_URL` | `https://www.nero-familienbesitz.de` (die Domain ohne www leitet dorthin um) |
   | `RESEND_API_KEY` | vorhanden (Kontaktformular) |
   | `SOSOVALUE_API_KEY` | optional; nur nötig, falls SoSoValue die ETF-Daten irgendwann nur noch mit Key liefert |

   Die lokalen Werte stehen in `.env.local` (nicht im Git).
4. **Deploy** über `main`. Danach einmal von Hand prüfen:
   ```bash
   curl -L -H "Authorization: Bearer <CRON_SECRET>" https://www.nero-familienbesitz.de/api/orakel/cron
   ```
   Antwort ist ein JSON mit `status`, `errors` und den Pegeln. Dann den geheimen Link öffnen.

## Resend: Domain verifizieren

Stand 15.09.2026, 19:40 Uhr: Domain `nero-familienbesitz.de` ist bei Resend **verifiziert**, alle drei Einträge stehen.
`ORAKEL_MAIL_FROM` kann daher `NERO Orakel <orakel@nero-familienbesitz.de>` sein.

Zur Dokumentation, falls die Domain je neu eingerichtet wird: Solange die Domain nicht verifiziert ist, sendet Resend nur von `onboarding@resend.dev` und nur an die
Adresse des Resend-Kontos. Für Mails an Jörg müssen diese drei DNS-Einträge bei Strato für
`nero-familienbesitz.de` gesetzt werden (Stand 15.09.2026 aus dem Resend-Konto, Domain bereits angelegt):

| Typ | Name | Wert |
|---|---|---|
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCoCrxcQPMTG4SF5tVh/UrWqJ1JzUXq…` (vollständigen Wert im Resend-Dashboard kopieren) |
| CNAME | `rsend` | `rsend-euw1.forge.rmta.net` |
| CNAME | `send` | `send.forge.rmta.net` |

Nach dem Setzen im Resend-Dashboard auf „Verify“ klicken und `ORAKEL_MAIL_FROM` auf die eigene Domain umstellen.
Die MX-Einträge der Domain bleiben unverändert; Resend versendet nur, empfängt nicht.

## Lokal arbeiten

```bash
npm run orakel:run        # ein Lauf gegen die lokale PGlite-Datenbank unter .orakel-db/
npm run dev               # Seite unter http://localhost:3000/orakel/zugang/<ORAKEL_TOKEN aus .env.local>
npx tsx scripts/orakel-dump.ts | python3 scripts/orakel-print.py   # letzten Stand lesbar ausgeben
npx tsx scripts/orakel-backtest.ts                                   # Rücktest der preisbasierten Signale
```

Läuft der Dev-Server, hält er die PGlite-Datei; `orakel:run` dann nicht parallel starten, sondern den
Cron-Endpunkt mit dem Secret aufrufen (siehe oben, gegen `localhost:3000`).

Ohne `ORAKEL_MAIL_TO` werden keine Mails versendet.

## Mails

Gebündelt, höchstens eine Mail je Stunde, jeder Auslöser höchstens einmal je 24 Stunden:
- **Warnung:** Spannung ab 75, oder Anstieg um mindestens 20 Punkte innerhalb von 24 Stunden.
- **Gelegenheit:** Neigung stark bullisch oder stark bärisch bei Spannung ab 50.
- **Termin:** 24 Stunden vor CPI, Arbeitsmarktbericht, FOMC oder einem Deribit-Verfall ab 5 Mrd. $.
- **Störung** (an `ORAKEL_MAIL_ADMIN`): beide Coins konnten nicht berechnet werden.

## Signale

Spannung (gewichtetes Mittel der Signalwerte, mal Kalenderfaktor 1,5 bei Makrotermin binnen 24 Std., 1,2 bei großem
Verfall, 1,1 am Wochenende):

| Signal | Quelle | Evidenz | Was hoch bedeutet |
|---|---|---|---|
| Volatilitätskompression | Kraken | belegt | ruhiger Kurs vor Ausbruch (Richtung offen) |
| Laufzeitstruktur 7/30 Tage | Deribit | belegt | 7-Tage-IV über 30-Tage-IV: Stress |
| Volatilitätsprämie (DVOL minus RV) | Deribit, Kraken | belegt | negativ: Markt bewegt sich mehr als eingepreist |
| Hebelquote OI/Marktkapitalisierung | OKX, CoinGecko | plausibel | viel Hebel, Kaskaden wahrscheinlicher |
| Funding-Rate, Perzentil und Serie | OKX (Bybit Kontext) | belegt | einseitige gehebelte Positionierung |
| 25-Delta-Skew | Deribit | plausibel | Absicherungsnachfrage oder Sorglosigkeit |
| Futures-Basis gegen 2-Jahres-Zins | OKX, FRED | plausibel | Carry-Unwind-Risiko oder Überhitzung |

Neigung (gewichtete Summe, fünf Stufen): Positionsaufbau aus Preis × OI, 30-Tage-Funding-Regime,
ETF-Zuflüsse (5 Tage), Liquidations-Impuls (OKX, 24 Std.).

Alle Schwellen sind rollierende Perzentile über bis zu 365 Tage. Signale mit kurzer Historie tragen den Vermerk
„vorläufig“ (Laufzeitstruktur, Skew, Basis, Liquidationen: die Historie entsteht erst durch die eigenen Läufe;
nach etwa 60 Läufen mit Tagesabstand gilt sie als belastbar).

Bewusst nicht in den Pegeln: Fear & Greed (Studien: kein Vorhersagewert), Max Pain als Kursziel (kein belegtes Pinning
in Krypto), modellierte Liquidationszonen, USD/JPY-Korrelation. Sie erscheinen nur als Kontext.

## Rücktest (15.09.2026, nur preisbasierte Signale, da andere Historien fehlen)

Volatilitätskompression stand ein bis drei Tage vor dem Short-Squeeze vom 19./20.08.2026 bei 94 bis 97 von 100
(BTC und ETH), vor der Kaskade vom 10.10.2025 dagegen bei 0 bis 23 (die kam aus dem Hebel, nicht aus der Ruhe).
Die Volatilitätsprämie stand vor dem Long-Flush vom 22.08.2026 bei 83. Basisrate: Das Kompressionssignal steht an
etwa einem Viertel aller Tage über 65; die mittlere 5-Tage-Bewegung danach lag bei 3,8 % gegen 3,4 % an den übrigen
Tagen (BTC) und 6,0 % gegen 5,6 % (ETH). Das ist eine schwache, aber vorhandene Trennschärfe, keine Prognose.
Die übrigen Signale lassen sich erst rücktesten, wenn die eigene Historie gewachsen ist.

## Pflege

- `src/lib/orakel/data/kalender.json` jährlich im Dezember um die Termine des Folgejahres ergänzen
  (BLS-Kalender für CPI und Arbeitsmarkt, Fed-Kalender für FOMC).
- Fällt eine Quelle dauerhaft aus, steht sie in der Seite unten („Beim letzten Lauf nicht erreichbar“) und in
  `orakel.runs.notes`. Der Pegel rechnet dann ohne dieses Signal weiter und zeigt es als „fehlt“.
- Schemaänderungen nur in `src/lib/orakel/db/schema.ts`, dann `npm run orakel:generate` und `npm run orakel:migrate`.
