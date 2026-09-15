// Propstack CRM Anbindung
// Legt Kontakte aus dem Website-Formular direkt in Propstack an.
// Doku: https://docs.propstack.de (API v1, Endpoint POST /v1/contacts)
//
// Benötigt die Umgebungsvariable PROPSTACK_API_KEY (siehe .env.local
// und PROPSTACK-SETUP.md). Ist kein Key gesetzt, wird der Schritt
// einfach übersprungen — die Website funktioniert trotzdem.

type ContactPayload = {
  name: string;
  company?: string;
  role?: string;
  email: string;
  phone?: string;
  message?: string;
};

export async function createPropstackContact(data: ContactPayload): Promise<
  { ok: true; id?: number } | { ok: false; skipped?: boolean; error?: string }
> {
  const apiKey = process.env.PROPSTACK_API_KEY;
  if (!apiKey) {
    console.warn("[propstack] PROPSTACK_API_KEY nicht gesetzt — Kontakt wird nicht ins CRM übertragen.");
    return { ok: false, skipped: true };
  }

  // Name in Vor-/Nachname aufteilen (Propstack erwartet getrennte Felder)
  const parts = data.name.trim().split(/\s+/);
  const first_name = parts.length > 1 ? parts.slice(0, -1).join(" ") : "";
  const last_name = parts.length > 1 ? parts[parts.length - 1] : parts[0];

  const description = [
    "Anfrage über nero-familienbesitz.de (Kontaktformular)",
    data.role ? `Kontaktart: ${data.role}` : null,
    data.message ? `Nachricht:\n${data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const res = await fetch("https://api.propstack.de/v1/contacts", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client: {
          first_name,
          last_name,
          email: data.email,
          home_cell: data.phone || undefined,
          company: data.company || undefined,
          description,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[propstack] Fehler ${res.status}: ${body}`);
      return { ok: false, error: `HTTP ${res.status}` };
    }

    const json = (await res.json().catch(() => ({}))) as { id?: number };
    console.log(`[propstack] Kontakt angelegt/aktualisiert (id: ${json.id ?? "?"})`);

    // Zusätzlich eine Aktivität (Notiz) am Kontakt anlegen,
    // zugewiesen an einen Nutzer (broker_id = "Personenschlüssel").
    if (json.id) {
      await createPropstackActivity(apiKey, json.id, description);
    }

    return { ok: true, id: json.id };
  } catch (err) {
    console.error("[propstack] Netzwerkfehler:", err);
    return { ok: false, error: String(err) };
  }
}

// Legt eine Aufgabe am Kontakt an (POST /v1/tasks mit is_reminder: true).
// PROPSTACK_BROKER_ID: Nutzer, dem die Aktivität zugewiesen wird (Pflicht lt. CRM-Inhaber).
// PROPSTACK_NOTE_TYPE_ID: optional, Aktivitätsart (z. B. "Anfrage").
async function createPropstackActivity(
  apiKey: string,
  clientId: number,
  body: string
): Promise<void> {
  const brokerId = process.env.PROPSTACK_BROKER_ID;
  const noteTypeId = process.env.PROPSTACK_NOTE_TYPE_ID;

  if (!brokerId) {
    console.warn(
      "[propstack] PROPSTACK_BROKER_ID nicht gesetzt — Aktivität wird ohne Nutzer-Zuordnung angelegt."
    );
  }

  try {
    const res = await fetch("https://api.propstack.de/v1/tasks", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: {
          title: "Anfrage über nero-familienbesitz.de",
          is_reminder: true, // true = echte Aufgabe, false/fehlt = nur Notiz
          due_date: new Date().toISOString(), // Fälligkeit = Eingangszeitpunkt der Anfrage
          body,
          client_ids: [clientId],
          broker_id: brokerId ? Number(brokerId) : undefined,
          note_type_id: noteTypeId ? Number(noteTypeId) : undefined,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[propstack] Aktivität fehlgeschlagen ${res.status}: ${text}`);
    } else {
      console.log(`[propstack] Aktivität am Kontakt ${clientId} angelegt.`);
    }
  } catch (err) {
    console.error("[propstack] Aktivität Netzwerkfehler:", err);
  }
}
