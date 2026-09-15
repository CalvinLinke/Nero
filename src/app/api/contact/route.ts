import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    // Fehlender Schluessel darf nicht zum Absturz fuehren, sondern zu einer
    // klaren Fehlermeldung im Log (Vercel: Settings -> Environment Variables).
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[contact] RESEND_API_KEY ist nicht gesetzt.");
      return NextResponse.json(
        { error: "Server-Konfigurationsfehler." },
        { status: 500 }
      );
    }
    const resend = new Resend(apiKey);

    // Absender muss zu einer bei Resend verifizierten Domain gehoeren.
    // Bis nero-familienbesitz.de dort verifiziert ist, per CONTACT_FROM
    // eine Adresse einer bereits verifizierten Domain setzen.
    const from =
      process.env.CONTACT_FROM || "NERO Website <website@nero-familienbesitz.de>";

    const { name, company, role, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, E-Mail und Nachricht sind Pflichtfelder." },
        { status: 400 }
      );
    }

    const contactEmailRaw = process.env.CONTACT_EMAIL;
    if (!contactEmailRaw) {
      console.error("[contact] CONTACT_EMAIL ist nicht gesetzt.");
      return NextResponse.json(
        { error: "Server-Konfigurationsfehler." },
        { status: 500 }
      );
    }
    // Mehrere Empfaenger mit Komma trennen; Resend erwartet eine Liste.
    const contactEmail = contactEmailRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error: sendError } = await resend.emails.send({
      from,
      to: contactEmail,
      replyTo: email,
      subject: `Neue Kontaktanfrage — ${name}${role ? ` · ${role}` : ""}${company ? ` (${company})` : ""}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; color: #2c2c2c;">
          <h2 style="font-size: 20px; margin-bottom: 24px;">Neue Anfrage über nero-familienbesitz.de</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; width: 120px; vertical-align: top;">Name</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            ${company ? `
            <tr>
              <td style="padding: 8px 0; color: #666; vertical-align: top;">Unternehmen</td>
              <td style="padding: 8px 0;">${company}</td>
            </tr>` : ""}
            ${role ? `
            <tr>
              <td style="padding: 8px 0; color: #666; vertical-align: top;">Kontaktart</td>
              <td style="padding: 8px 0; font-weight: bold;">${role}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 8px 0; color: #666; vertical-align: top;">E-Mail</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #2d6060;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; vertical-align: top;">Nachricht</td>
              <td style="padding: 8px 0; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
        </div>
      `,
    });

    // Das SDK wirft bei Ablehnung keinen Fehler, sondern liefert ihn zurueck.
    if (sendError) {
      console.error("[contact] Resend hat den Versand abgelehnt:", sendError);
      return NextResponse.json(
        { error: "E-Mail konnte nicht versendet werden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Fehler beim Senden der E-Mail." },
      { status: 500 }
    );
  }
}
