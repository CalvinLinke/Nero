# Propstack-Anbindung — Schritt-für-Schritt-Anleitung

Das Kontaktformular der Website legt jetzt jeden Anfrager automatisch
als Kontakt in Propstack an (zusätzlich zur E-Mail per Resend).
Der Code ist fertig — **es fehlt nur noch der API-Schlüssel.**

---

## 1. API-Schlüssel in Propstack erzeugen

1. In Propstack einloggen: https://crm.propstack.de
2. Oben auf **Verwaltung** klicken (Zahnrad-Symbol).
3. Links unter „Schnittstellen" auf **API-Schlüssel** klicken.
   (Direkt-Link: https://crm.propstack.de/app/admin/api_keys)
4. Auf den Button **„+ API-Schlüssel hinzufügen"** klicken.
5. Einen Namen vergeben, z. B. `NERO Website Kontaktformular`.
6. Bei den Rechten/Berechtigungen: Es reicht das Recht, **Kontakte
   anzulegen/zu bearbeiten** (Kontakte: Schreiben). Mehr Rechte bitte
   NICHT vergeben — der Schlüssel soll nur können, was er muss.
7. Speichern. Propstack zeigt jetzt eine lange Zeichenkette an
   (ähnlich wie `YhxlTRyET...`). Das ist der API-Schlüssel.
8. Den Schlüssel **komplett kopieren** (Klick auf den Schlüssel oder
   markieren + Cmd/Strg+C).

> Wichtig: Der Schlüssel ist wie ein Passwort. Niemals per E-Mail
> verschicken, nicht in den Code schreiben, nicht committen.

## 2. Schlüssel lokal eintragen (zum Testen)

1. Im Projektordner die Datei `.env.local` öffnen.
2. Dort gibt es bereits die Zeile:

   ```
   PROPSTACK_API_KEY=
   ```

3. Den kopierten Schlüssel direkt hinter das `=` einfügen
   (ohne Anführungszeichen, ohne Leerzeichen):

   ```
   PROPSTACK_API_KEY=DeinLangerSchluesselHier
   ```

4. Speichern und den Dev-Server neu starten (`npm run dev`),
   damit die Variable geladen wird.

## 3. Schlüssel bei Vercel eintragen (für die Live-Website)

1. https://vercel.com öffnen und einloggen.
2. Das Projekt der NERO-Website anklicken.
3. Oben auf **Settings** → links auf **Environment Variables**.
4. Neue Variable anlegen:
   - **Name:** `PROPSTACK_API_KEY`
   - **Value:** der kopierte Schlüssel
   - **Environments:** Production (gern auch Preview) anhaken
5. **Save** klicken.
6. Wichtig: Einmal neu deployen (Tab **Deployments** → beim letzten
   Deployment auf „⋯" → **Redeploy**), sonst kennt die Live-Seite
   die Variable noch nicht.

## 4. Testen

1. Auf der Website das Kontaktformular ausfüllen und absenden
   (gern mit einer eigenen Test-E-Mail-Adresse).
2. In Propstack unter **Kontakte** nachsehen: Der Test-Kontakt
   sollte dort auftauchen — mit Name, E-Mail, Telefon, Firma und
   der Nachricht in der Beschreibung.
3. Falls nicht: In Vercel unter **Deployments → Logs** (oder lokal
   im Terminal) nach Zeilen suchen, die mit `[propstack]` beginnen —
   dort steht die Fehlerursache.

---

## Was wurde im Code geändert?

- **`src/lib/propstack.ts`** (neu): Funktion `createPropstackContact`,
  die den Kontakt per `POST https://api.propstack.de/v1/contacts`
  (Header `X-API-KEY`) an Propstack schickt. Existiert die
  E-Mail-Adresse in Propstack schon, wird der Kontakt dort
  aktualisiert statt doppelt angelegt (Propstack-Standardverhalten).
- **`src/app/api/contact/route.ts`**: Ruft diese Funktion beim
  Formularversand zusätzlich zur Resend-E-Mail auf. Fehler bei
  Propstack blockieren die E-Mail NICHT — schlimmstenfalls kommt die
  Anfrage nur per Mail an und im Log steht `[propstack] Fehler ...`.
- **`.env.local`**: Platzhalter `PROPSTACK_API_KEY=` ergänzt.

Ist `PROPSTACK_API_KEY` leer, läuft alles wie bisher (nur E-Mail).

---

## Update (Sept. 2026): Aktivität mit Nutzer-Zuordnung

Jeder neue Website-Kontakt bekommt jetzt automatisch eine Aktivität
(Notiz „Anfrage über nero-familienbesitz.de") am Kontakt, zugewiesen
an einen Propstack-Nutzer. Dafür braucht es zwei weitere Variablen in
`.env.local` (und später in Vercel):

- `PROPSTACK_BROKER_ID` — die Nutzer-ID („Personenschlüssel") des
  Propstack-Nutzers, dem die Aktivität zugeordnet wird.
- `PROPSTACK_NOTE_TYPE_ID` — optional: die ID der Aktivitätsart
  (z. B. „Anfrage"). Leer lassen ist okay.

### Benötigte Rechte am API-Schlüssel

Die 401-Fehler im Propstack-Log bedeuten: Der Schlüssel darf diese
Endpunkte nicht aufrufen. Der Datenbank-Inhaber muss dem Schlüssel
folgende Rechte geben:

- Kontakte: lesen + schreiben
- Aufgaben/Notizen (Aktivitäten): schreiben
- Nutzer (Broker): lesen  — nur nötig, um einmalig die IDs auszulesen
- Aktivitätsarten: lesen  — ebenfalls nur zum einmaligen Auslesen

### IDs herausfinden (einmalig, im Terminal)

```bash
cd ~/Developer/Projekte/"Nero Familienbesitz"
key=$(grep '^PROPSTACK_API_KEY=' .env.local | cut -d= -f2-)

# Nutzer und ihre IDs:
curl -s https://api.propstack.de/v1/brokers -H "X-API-KEY: $key"

# Aktivitätsarten und ihre IDs:
curl -s https://api.propstack.de/v1/activity_types -H "X-API-KEY: $key"
```

Aus der Antwort die `id` des gewünschten Nutzers bzw. der
Aktivitätsart „Anfrage" in `.env.local` eintragen.

### Test (im Terminal)

```bash
cd ~/Developer/Projekte/"Nero Familienbesitz"
key=$(grep '^PROPSTACK_API_KEY=' .env.local | cut -d= -f2-)
broker=$(grep '^PROPSTACK_BROKER_ID=' .env.local | cut -d= -f2-)
curl -s https://api.propstack.de/v1/tasks -H "X-API-KEY: $key" \
  -H "Content-Type: application/json" \
  -d "{\"task\":{\"title\":\"Test-Aktivität Website\",\"body\":\"Kann gelöscht werden.\",\"client_ids\":[36539603],\"broker_id\":$broker}}"
```

Antwort mit einer `id` = funktioniert. 401 = Rechte fehlen weiterhin.

### Vercel

Alle vier Variablen (`PROPSTACK_API_KEY`, `PROPSTACK_BROKER_ID`,
`PROPSTACK_NOTE_TYPE_ID`, plus wie gehabt `RESEND_API_KEY` /
`CONTACT_EMAIL`) unter Settings → Environment Variables eintragen
und redeployen.
